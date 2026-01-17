// pages/home/home.js
Page({
  data: {
    pets: [],
    currentDate: '',
    feedingRecords: {},
    feedingSummaries: {}, // 存储每个宠物的进食汇总信息
    nfcScanCounts: {}, // 存储每个宠物当日的NFC刷卡次数
    showHungryModal: false, // 控制饥饿弹窗显示
    hungryPet: null, // 当前饥饿的宠物信息
  },

  onLoad() {
    this.initializeSampleData();
    this.loadPets();
    this.setCurrentDate();
    this.loadTodayFeedingRecords();
    this.loadTodayNfcCounts();
  },

  onShow() {
    this.loadPets();
    this.loadTodayFeedingRecords();
    this.loadTodayNfcCounts();
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
        
        // 创建今日的NFC刷卡记录（示例：猫胖已刷5次）
        const sampleNfcRecords = {
          [todayStr]: {
            'cat1': 5, // 猫胖已刷5次
            'cat2': 2  // 猫瘦刷了2次
          }
        };
        
        wx.setStorageSync('nfcRecords', sampleNfcRecords);
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

  manualFeed(e) {
  const petId = e.currentTarget.dataset.petid;
  this.sendFeedCommand(petId, true);

  wx.showToast({
    title: '已手动投喂',
    icon: 'success'
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
      
      // 计算每个宠物的进食汇总
      const feedingSummaries = {};
      const { pets } = this.data;
      
      pets.forEach(pet => {
        const records = todayRecords[pet.id] || [];
        const totalAmount = records.reduce((total, record) => total + record.amount, 0);
        feedingSummaries[pet.id] = {
          count: records.length,
          totalAmount: totalAmount,
          maxFeedings: pet.maxFeedingsPerDay || 3
        };
      });
      
      this.setData({ 
        feedingRecords: todayRecords,
        feedingSummaries: feedingSummaries
      });
    } catch (e) {
      console.error('加载今日喂食记录失败', e);
    }
  },

  // 加载今日NFC刷卡次数
  loadTodayNfcCounts() {
    try {
      const today = this.data.currentDate;
      const allNfcRecords = wx.getStorageSync('nfcRecords') || {};
      const todayNfcRecords = allNfcRecords[today] || {};
      
      this.setData({ nfcScanCounts: todayNfcRecords });
      
      // 检查是否有宠物达到5次刷卡，显示饥饿弹窗
      this.checkHungryPets(todayNfcRecords);
    } catch (e) {
      console.error('加载今日NFC记录失败', e);
    }
  },

  // 检查饥饿的宠物
  checkHungryPets(nfcCounts) {
    const { pets } = this.data;
    
    pets.forEach(pet => {
      const scanCount = nfcCounts[pet.id] || 0;
      if (scanCount >= 5) {
        // 显示饥饿弹窗
        this.setData({
          showHungryModal: true,
          hungryPet: pet
        });
      }
    });
  },

  // 关闭饥饿弹窗
  closeHungryModal() {
    this.setData({
      showHungryModal: false,
      hungryPet: null
    });
  },

  // 立即投喂
  feedNow() {
    const { hungryPet } = this.data;
    if (hungryPet) {
      // 发送投粮指令给投食机
      this.sendFeedCommand(hungryPet.id, true);
      
      wx.showToast({
        title: `已发送投粮指令给${hungryPet.name}的投食机`,
        icon: 'success',
        duration: 2000
      });
    }
    this.closeHungryModal();
  },

  // 帮助减肥
  helpDiet() {
    const { hungryPet } = this.data;
    if (hungryPet) {
      // 发送不投粮指令给投食机
      this.sendFeedCommand(hungryPet.id, false);
      
      wx.showToast({
        title: `已发送不投粮指令，${hungryPet.name}需要减肥`,
        icon: 'success',
        duration: 2000
      });
    }
    this.closeHungryModal();
  },

  // 发送指令给投食机
  // 发送指令给投食机
sendFeedCommand(petId, shouldFeed) {
  const { pets } = this.data;
  const pet = pets.find(p => p.id === petId);

  if (!pet) {
    console.error('未找到对应的宠物');
    return;
  }

  const commandType = shouldFeed ? 'FEED' : 'NO_FEED';

  // 构建指令数据（与后端接口匹配）
  const command = {
    pet_id: petId,
    command_type: commandType,
    should_feed: shouldFeed ? 1 : 0
  };

  console.log('发送投食机指令:', command);

  // 发给后端
  wx.request({
    url: 'http://192.168.1.121:3300/feed_commands',
    method: 'POST',
    data: command,
    success: res => {
      console.log('feed_commands 后端返回:', res.data);
      if (res.data.success) {
        wx.showToast({
          title: '指令发送成功',
          icon: 'success'
        });
      } else {
        wx.showToast({
          title: '指令发送失败',
          icon: 'error'
        });
      }
    },
    fail: err => {
      console.error('feed_commands 请求失败:', err);
      wx.showToast({
        title: '网络请求失败',
        icon: 'error'
      });
    }
  });

  // 本地存一份
  try {
    const commandHistory = wx.getStorageSync('feedCommands') || [];
    commandHistory.push({
      ...command,
      petName: pet.name,
      timestamp: new Date().toISOString()
    });

    if (commandHistory.length > 50) {
      commandHistory.splice(0, commandHistory.length - 50);
    }

    wx.setStorageSync('feedCommands', commandHistory);
  } catch (e) {
    console.error('保存指令记录失败:', e);
  }
},



})