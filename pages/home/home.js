// pages/home/home.js
Page({
  data: {
    pets: [],
    currentDate: '',
    feedingRecords: {}
  },

  onLoad() {
    this.initializeSampleData();
    this.loadPets();
    this.setCurrentDate();
    this.loadTodayFeedingRecords();
  },

  onShow() {
    this.loadPets();
    this.loadTodayFeedingRecords();
  },

  initializeSampleData() {
    try {
      // 检查是否已经有数据，如果没有则创建示例数据
      const existingPets = wx.getStorageSync('pets');
      if (!existingPets || existingPets.length === 0) {
        // 创建两只示例猫咪
        const samplePets = [
          {
            id: 'cat1',
            name: '猫胖',
            maxFeedingsPerDay: 3,
            feedingAmount: 50,
            avatar: ''
          },
          {
            id: 'cat2', 
            name: '猫瘦',
            maxFeedingsPerDay: 2,
            feedingAmount: 100,
            avatar: ''
          }
        ];
        
        wx.setStorageSync('pets', samplePets);
        
        // 创建今日的喂食记录
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;
        
        const sampleFeedingRecords = {
          [todayStr]: {
            'cat1': [
              { time: '09:45', amount: 50 },
              { time: '10:40', amount: 50 }
            ],
            'cat2': [
              { time: '15:10', amount: 100 }
            ]
          }
        };
        
        wx.setStorageSync('feedingRecords', sampleFeedingRecords);
      }
    } catch (e) {
      console.error('初始化示例数据失败', e);
    }
  },

  setCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    this.setData({
      currentDate: `${year}-${month}-${day}`
    });
  },

  loadPets() {
    try {
      const pets = wx.getStorageSync('pets') || [];
      this.setData({ pets });
    } catch (e) {
      console.error('加载宠物信息失败', e);
    }
  },

  loadTodayFeedingRecords() {
    try {
      const today = this.data.currentDate;
      const allRecords = wx.getStorageSync('feedingRecords') || {};
      const todayRecords = allRecords[today] || {};
      this.setData({ feedingRecords: todayRecords });
    } catch (e) {
      console.error('加载今日喂食记录失败', e);
    }
  },

  showFeedModal() {
    const { pets } = this.data;
    
    if (pets.length === 0) {
      wx.showToast({
        title: '请先添加宠物',
        icon: 'none'
      });
      return;
    }

    // 直接显示投喂量选择器
    this.showFeedAmountPicker();
  },

  showFeedAmountPicker() {
    // 创建0-200g的选择范围，每5g一个选项
    const amounts = [];
    for (let i = 0; i <= 200; i += 5) {
      amounts.push(i + 'g');
    }
    
    wx.showPicker({
      range: amounts,
      success: (res) => {
        const selectedAmount = parseInt(amounts[res.range[0]]);
        // 选择完投喂量后，再选择宠物
        this.selectPetForFeeding(selectedAmount);
      }
    });
  },

  selectPetForFeeding(amount) {
    const { pets } = this.data;
    const petNames = pets.map(pet => pet.name);
    
    wx.showActionSheet({
      itemList: petNames,
      success: (res) => {
        const selectedPet = pets[res.tapIndex];
        this.feedPetWithAmount(selectedPet, amount);
      }
    });
  },

  feedPetWithAmount(pet, amount) {
    const today = this.data.currentDate;
    const currentFeedings = this.data.feedingRecords[pet.id] || [];
    
    if (currentFeedings.length >= pet.maxFeedingsPerDay) {
      wx.showToast({
        title: `${pet.name}今日已达到最大喂食次数`,
        icon: 'none'
      });
      return;
    }

    const now = new Date();
    const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const newFeeding = {
      time: timeString,
      amount: amount
    };

    const updatedFeedings = [...currentFeedings, newFeeding];
    const updatedRecords = {
      ...this.data.feedingRecords,
      [pet.id]: updatedFeedings
    };

    // 保存到本地存储
    try {
      const allRecords = wx.getStorageSync('feedingRecords') || {};
      allRecords[today] = updatedRecords;
      wx.setStorageSync('feedingRecords', allRecords);
      
      this.setData({ feedingRecords: updatedRecords });
      
      wx.showToast({
        title: `已为${pet.name}投喂${amount}g`,
        icon: 'success'
      });
    } catch (e) {
      console.error('保存喂食记录失败', e);
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      });
    }
  }
})