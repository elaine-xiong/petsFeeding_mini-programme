// pages/profile/profile.js
Page({
  data: {
    isLoggedIn: false,
    userInfo: {
      avatarUrl: '',
      nickName: ''
    },
    pets: [],
    showPetForm: false,
    editingPetId: null,
    petForm: {
      name: '',
      maxFeedingsPerDay: 2,
      feedingAmount: 50,
      avatar: ''
    }
  },

  onLoad: function () {
    console.log('页面加载');
    this.loadUserInfo();
    this.loadPets();
  },
  noop: function() {
    // 空函数，仅用于阻止事件冒泡
  },
  loadUserInfo: function () {
    try {
      var userInfo = wx.getStorageSync('userInfo');
      console.log('从存储加载用户信息:', userInfo);
      if (userInfo) {
        this.setData({
          isLoggedIn: true,
          userInfo: userInfo
        });
        console.log('用户已登录');
      } else {
        console.log('用户未登录');
        this.setData({
          isLoggedIn: false,
          userInfo: {
            avatarUrl: '',
            nickName: ''
          }
        });
      }
    } catch (e) {
      console.error('加载用户信息失败', e);
    }
  },

  onChooseAvatar: function(e) {
    console.log('选择头像事件');
    const avatarUrl = e.detail.avatarUrl;
    console.log('头像URL:', avatarUrl);
    
    this.setData({
      'userInfo.avatarUrl': avatarUrl
    });
    
    console.log('更新后userInfo:', this.data.userInfo);
  },

  onNicknameChange: function(e) {
    console.log('昵称输入事件');
    const value = e.detail.value;
    console.log('昵称值:', value);
    
    this.setData({
      'userInfo.nickName': value
    });
    
    console.log('更新后userInfo:', this.data.userInfo);
  },
//不管了兄弟！现在这个名字是输进去！但是图片加载不进去！没事的！再说！12.17 22:23
  login: function () {
    console.log('=== 登录开始 ===');
    console.log('当前userInfo:', this.data.userInfo);
    
    const userInfo = this.data.userInfo;
    
    // 检查昵称
    if (!userInfo.nickName || !userInfo.nickName.trim()) {
      console.log('昵称验证失败');
      wx.showToast({
        title: '请输入昵称',
        icon: 'none'
      });
      return;
    }
    
    // 检查头像
    if (!userInfo.avatarUrl) {
      console.log('头像验证失败');
      wx.showToast({
        title: '请选择头像',
        icon: 'none'
      });
      return;
    }
    
    console.log('=== 登录验证通过 ===');
    
    try {
      wx.setStorageSync('userInfo', userInfo);
      console.log('用户信息保存到存储');

       // 向后端发送数据
      wx.request({
      url: 'http://192.168.1.121:3300/users',
      method: 'POST',
      data: {
        nickname: userInfo.nickName,
        avatar_url: userInfo.avatarUrl
      },
      success: (res) => {
        console.log('用户数据发送到后端成功:', res.data);
      },
      fail: (err) => {
        console.error('发送用户数据到后端失败:', err);
        wx.showToast({
          title: '数据同步失败',
          icon: 'none'
        });
      }
    });
      
      this.setData({
        isLoggedIn: true
      });
      
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      });
      
      this.loadPets();
    } catch (e) {
      console.error('登录失败', e);
      wx.showToast({
        title: '登录失败',
        icon: 'error'
      });
    }
  },

  logout: function () {
    var that = this;
    wx.showModal({
      title: '确认退出',
      content: '退出登录后将清除所有数据',
      success: function (res) {
        if (res.confirm) {
          try {
            wx.clearStorageSync();
            that.setData({
              isLoggedIn: false,
              userInfo: {
                avatarUrl: '',
                nickName: ''
              },
              pets: [],
              showPetForm: false,
              editingPetId: null,
              petForm: {
                name: '',
                maxFeedingsPerDay: 2,
                feedingAmount: 50,
                avatar: ''
              }
            });
            wx.showToast({
              title: '已退出登录',
              icon: 'success'
            });
          } catch (e) {
            console.error('退出登录失败', e);
            wx.showToast({
              title: '退出失败',
              icon: 'error'
            });
          }
        }
      }
    });
  },

  loadPets: function () {
    try {
      var pets = wx.getStorageSync('pets') || [];
      console.log('从存储加载宠物数据:', pets);
      this.setData({
        pets: pets
      });
    } catch (e) {
      console.error('加载宠物信息失败', e);
    }
  },

  showAddPetForm: function () {
    console.log('显示添加宠物表单');
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
    console.log('表单数据已重置:', this.data.petForm);
  },

  hidePetForm: function () {
    console.log('隐藏宠物表单');
    this.setData({
      showPetForm: false,
      editingPetId: null
    });
  },

  onPetNameChange: function (e) {
    console.log('宠物名称输入:', e.detail.value);
    this.setData({
      'petForm.name': e.detail.value
    });
  },

  onMaxFeedingsChange: function (e) {
    console.log('最大喂食次数输入:', e.detail.value);
    var val = parseInt(e.detail.value);
    if (isNaN(val)) val = 2;
    this.setData({
      'petForm.maxFeedingsPerDay': val
    });
  },

  onFeedingAmountChange: function (e) {
    console.log('每次喂食量输入:', e.detail.value);
    var val = parseInt(e.detail.value);
    if (isNaN(val)) val = 50;
    this.setData({
      'petForm.feedingAmount': val
    });
  },

  choosePetAvatar: function () {
    console.log('开始选择宠物头像');
    var that = this;
    
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        console.log('选择图片成功');
        var filePath = res.tempFilePaths[0];
        console.log('文件路径:', filePath);
        that.setData({
          'petForm.avatar': filePath
        });
      },
      fail: function (err) {
        console.error('选择头像失败:', err);
        wx.showToast({
          title: '选择头像失败',
          icon: 'none'
        });
      }
    });
  },

  savePet: function () {
    console.log('=== 开始保存宠物 ===');
    console.log('表单数据:', this.data.petForm);
    
    // 使用更安全的方式获取数据
    var petForm = {
      name: (this.data.petForm.name || '').trim(),
      maxFeedingsPerDay: parseInt(this.data.petForm.maxFeedingsPerDay) || 2,
      feedingAmount: parseInt(this.data.petForm.feedingAmount) || 50,
      avatar: this.data.petForm.avatar || ''
    };
    
    var editingPetId = this.data.editingPetId;
    var pets = this.data.pets || [];
    
    console.log('处理后的数据:', { petForm, editingPetId, pets });

    // 验证输入
    if (!petForm.name) {
      console.log('验证失败: 宠物名称为空');
      wx.showToast({
        title: '请输入宠物名称',
        icon: 'none'
      });
      return;
    }
    
    if (petForm.maxFeedingsPerDay < 1) {
      console.log('验证失败: 喂食次数无效');
      wx.showToast({
        title: '喂食次数不能小于1',
        icon: 'none'
      });
      return;
    }
    
    if (petForm.feedingAmount < 1) {
      console.log('验证失败: 喂食量无效');
      wx.showToast({
        title: '喂食量不能小于1',
        icon: 'none'
      });
      return;
    }
    
    console.log('验证通过，开始保存');
    
    try {
      var updatedPets;
      var newPetId;
      
      if (editingPetId) {
        // 编辑模式
        console.log('编辑模式，宠物ID:', editingPetId);
        updatedPets = pets.map(function (pet) {
          if (pet.id === editingPetId) {
            return {
              id: editingPetId,
              name: petForm.name,
              maxFeedingsPerDay: petForm.maxFeedingsPerDay,
              feedingAmount: petForm.feedingAmount,
              avatar: petForm.avatar,
              createTime: pet.createTime || new Date().toISOString()
            };
          }
          return pet;
        });
        newPetId = editingPetId;
      } else {
        // 添加模式
        console.log('添加模式，创建新宠物');
        newPetId = 'pet_' + Date.now(); // 在这里定义 newPetId
        var newPet = {
          id: newPetId,
          name: petForm.name,
          maxFeedingsPerDay: petForm.maxFeedingsPerDay,
          feedingAmount: petForm.feedingAmount,
          avatar: petForm.avatar,
          createTime: new Date().toISOString()
        };
        updatedPets = pets.concat([newPet]);
      }
      
      console.log('更新后的宠物列表:', updatedPets);

      // 保存到本地存储
      wx.setStorageSync('pets', updatedPets);
      console.log('已保存到本地存储');

      // 同步到后端
    wx.request({
      url: 'http://192.168.1.121:3300/pets',
      method: 'POST',
      data: {
        id: newPetId,
        user_id: 1, // 使用固定的用户ID，实际应该使用真实的用户ID
        name: petForm.name,
        max_feedings_per_day: petForm.maxFeedingsPerDay,
        feeding_amount: petForm.feedingAmount,
        avatar_url: petForm.avatar
      },
      success: (res) => {
        console.log('宠物数据同步到后端成功:', res.data);
        if (!res.data.success) {
          console.error('后端返回错误:', res.data.error);
          wx.showToast({
            title: '数据同步失败',
            icon: 'none'
          });
        } else {
          wx.showToast({
            title: '数据同步成功',
            icon: 'success'
          });
        }
      },
      fail: (err) => {
        console.error('同步宠物数据到后端失败:', err);
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      }
    });

      // 更新界面
      this.setData({
        pets: updatedPets,
        showPetForm: false,
        editingPetId: null,
        petForm: {
          name: '',
          maxFeedingsPerDay: 2,
          feedingAmount: 50,
          avatar: ''
        }
      });
      
      console.log('界面更新完成');

      // 显示成功提示
      wx.showToast({
        title: editingPetId ? '修改成功' : '添加成功',
        icon: 'success'
      });
      
      console.log('=== 保存宠物完成 ===');
      
    } catch (error) {
      console.error('保存宠物时发生错误:', error);
      wx.showToast({
        title: '保存失败，请重试',
        icon: 'error'
      });
    }
  },

  editPet: function (e) {
    console.log('编辑宠物');
    var petId = e.currentTarget.dataset.petid;
    console.log('宠物ID:', petId);
    
    if (!petId) {
      console.log('没有找到宠物ID');
      return;
    }
    
    var pet = this.data.pets.find(function (p) {
      return p.id === petId;
    });
    
    if (pet) {
      console.log('找到宠物:', pet);
      this.setData({
        showPetForm: true,
        editingPetId: petId,
        petForm: {
          name: pet.name || '',
          maxFeedingsPerDay: pet.maxFeedingsPerDay || 2,
          feedingAmount: pet.feedingAmount || 50,
          avatar: pet.avatar || ''
        }
      });
    } else {
      console.log('未找到对应宠物');
    }
  },

  deletePet: function (e) {
    var that = this;
    var petId = e.currentTarget.dataset.petid;
    
    if (!petId) return;
    
    var pet = this.data.pets.find(function (p) {
      return p.id === petId;
    });
    
    if (!pet) return;

    wx.showModal({
      title: '确认删除',
      content: '确定要删除宠物 "' + (pet.name || '') + '" 吗？相关的喂食记录也会被删除。',
      success: function (res) {
        if (res.confirm) {
          try {
            var updatedPets = that.data.pets.filter(function (p) {
              return p.id !== petId;
            });
            
            wx.setStorageSync('pets', updatedPets);

            // 清理喂食记录
            var feedingRecords = wx.getStorageSync('feedingRecords') || {};
            Object.keys(feedingRecords).forEach(function (date) {
              if (feedingRecords[date] && feedingRecords[date][petId]) {
                delete feedingRecords[date][petId];
                if (Object.keys(feedingRecords[date]).length === 0) {
                  delete feedingRecords[date];
                }
              }
            });
            wx.setStorageSync('feedingRecords', feedingRecords);

            that.setData({
              pets: updatedPets
            });
            
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
  },
  
  // 测试方法：直接添加一个测试宠物
  testAddPet: function() {
    console.log('=== 测试添加宠物 ===');
    
    try {
      var pets = this.data.pets || [];
      var testPet = {
        id: 'test_' + Date.now(),
        name: '测试宠物',
        maxFeedingsPerDay: 3,
        feedingAmount: 100,
        avatar: '',
        createTime: new Date().toISOString()
      };
      
      var updatedPets = pets.concat([testPet]);
      
      console.log('测试宠物数据:', testPet);
      console.log('更新前宠物数:', pets.length);
      console.log('更新后宠物数:', updatedPets.length);
      
      wx.setStorageSync('pets', updatedPets);
      
      this.setData({
        pets: updatedPets,
        showPetForm: false
      });
      
      wx.showToast({
        title: '测试添加成功',
        icon: 'success'
      });
      
      console.log('=== 测试完成 ===');
      
    } catch (error) {
      console.error('测试失败:', error);
      wx.showToast({
        title: '测试失败: ' + error.message,
        icon: 'error'
      });
    }
  }
});