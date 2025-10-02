// pages/profile/profile.js
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
    isLoggedIn: false,
    userInfo: {
      avatarUrl: defaultAvatarUrl,
      nickName: ''
    },
    showPetForm: false,
    pets: [],
    petForm: {
      name: '',
      maxFeedingsPerDay: 2,
      feedingAmount: 50,
      avatar: ''
    },
    editingPetId: null
  },

  onLoad() {
    this.checkLoginStatus();
    this.loadPets();
  },

  onShow() {
    this.loadPets();
  },

  checkLoginStatus() {
    try {
      const userInfo = wx.getStorageSync('userInfo');
      if (userInfo && userInfo.nickName) {
        this.setData({
          isLoggedIn: true,
          userInfo: userInfo
        });
      }
    } catch (e) {
      console.error('检查登录状态失败', e);
    }
  },

  // 登录相关方法
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail;
    this.setData({
      'userInfo.avatarUrl': avatarUrl
    });
  },

  onNicknameChange(e) {
    const nickName = e.detail.value;
    this.setData({
      'userInfo.nickName': nickName
    });
  },

  login() {
    const { userInfo } = this.data;
    if (!userInfo.nickName.trim()) {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none'
      });
      return;
    }

    try {
      wx.setStorageSync('userInfo', userInfo);
      this.setData({ isLoggedIn: true });
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      });
    } catch (e) {
      console.error('登录失败', e);
      wx.showToast({
        title: '登录失败',
        icon: 'error'
      });
    }
  },

  logout() {
    wx.showModal({
      title: '确认退出',
      content: '退出登录后将清除所有数据',
      success: (res) => {
        if (res.confirm) {
          try {
            wx.clearStorageSync();
            this.setData({
              isLoggedIn: false,
              userInfo: {
                avatarUrl: defaultAvatarUrl,
                nickName: ''
              },
              pets: [],
              showPetForm: false
            });
            wx.showToast({
              title: '已退出登录',
              icon: 'success'
            });
          } catch (e) {
            console.error('退出登录失败', e);
          }
        }
      }
    });
  },

  // 宠物管理相关方法
  loadPets() {
    try {
      const pets = wx.getStorageSync('pets') || [];
      this.setData({ pets });
    } catch (e) {
      console.error('加载宠物信息失败', e);
    }
  },

  showAddPetForm() {
    this.setData({
      showPetForm: true,
      editingPetId: null,
      petForm: {
        name: '',
        maxFeedingsPerDay: 2,
        feedingAmount: 50,
        avatar: ''
      }
    });
  },

  hidePetForm() {
    this.setData({
      showPetForm: false,
      editingPetId: null
    });
  },

  onPetNameChange(e) {
    this.setData({
      'petForm.name': e.detail.value
    });
  },

  onMaxFeedingsChange(e) {
    this.setData({
      'petForm.maxFeedingsPerDay': parseInt(e.detail.value) || 1
    });
  },

  onFeedingAmountChange(e) {
    this.setData({
      'petForm.feedingAmount': parseInt(e.detail.value) || 1
    });
  },

  onPetAvatarChoose(e) {
    const { avatarUrl } = e.detail;
    this.setData({
      'petForm.avatar': avatarUrl
    });
  },

  savePet() {
    const { petForm, editingPetId, pets } = this.data;
    
    if (!petForm.name.trim()) {
      wx.showToast({
        title: '请输入宠物名称',
        icon: 'none'
      });
      return;
    }

    if (petForm.maxFeedingsPerDay < 1 || petForm.maxFeedingsPerDay > 10) {
      wx.showToast({
        title: '每日喂食次数应在1-10次之间',
        icon: 'none'
      });
      return;
    }

    if (petForm.feedingAmount < 1 || petForm.feedingAmount > 1000) {
      wx.showToast({
        title: '每次喂食量应在1-1000g之间',
        icon: 'none'
      });
      return;
    }

    try {
      let updatedPets;
      
      if (editingPetId) {
        // 编辑现有宠物
        updatedPets = pets.map(pet => 
          pet.id === editingPetId ? { ...petForm, id: editingPetId } : pet
        );
      } else {
        // 添加新宠物
        const newPet = {
          ...petForm,
          id: Date.now().toString()
        };
        updatedPets = [...pets, newPet];
      }

      wx.setStorageSync('pets', updatedPets);
      this.setData({
        pets: updatedPets,
        showPetForm: false
      });

      wx.showToast({
        title: editingPetId ? '修改成功' : '添加成功',
        icon: 'success'
      });
    } catch (e) {
      console.error('保存宠物信息失败', e);
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      });
    }
  },

  editPet(e) {
    const petId = e.currentTarget.dataset.petid;
    const pet = this.data.pets.find(p => p.id === petId);
    
    if (pet) {
      this.setData({
        showPetForm: true,
        editingPetId: petId,
        petForm: {
          name: pet.name,
          maxFeedingsPerDay: pet.maxFeedingsPerDay,
          feedingAmount: pet.feedingAmount,
          avatar: pet.avatar || ''
        }
      });
    }
  },

  deletePet(e) {
    const petId = e.currentTarget.dataset.petid;
    const pet = this.data.pets.find(p => p.id === petId);
    
    if (!pet) return;

    wx.showModal({
      title: '确认删除',
      content: `确定要删除宠物"${pet.name}"吗？相关的喂食记录也会被删除。`,
      success: (res) => {
        if (res.confirm) {
          try {
            const updatedPets = this.data.pets.filter(p => p.id !== petId);
            wx.setStorageSync('pets', updatedPets);
            
            // 删除相关的喂食记录
            const feedingRecords = wx.getStorageSync('feedingRecords') || {};
            Object.keys(feedingRecords).forEach(date => {
              if (feedingRecords[date][petId]) {
                delete feedingRecords[date][petId];
              }
            });
            wx.setStorageSync('feedingRecords', feedingRecords);
            
            this.setData({ pets: updatedPets });
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });
          } catch (e) {
            console.error('删除宠物失败', e);
            wx.showToast({
              title: '删除失败',
              icon: 'error'
            });
          }
        }
      }
    });
  }
})