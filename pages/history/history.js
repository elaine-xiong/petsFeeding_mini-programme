// pages/history/history.js
Page({
  data: {
    year: 2025,
    month: 10,
    calendarData: [],
    weekDays: ['日', '一', '二', '三', '四', '五', '六'],
    feedingRecords: {},
    selectedDate: null,
    selectedDateRecords: [],
    pets: []
  },

  onLoad() {
    this.generateCalendar();
    this.loadFeedingRecords();
    this.loadPets();
  },

  onShow() {
    this.loadFeedingRecords();
    this.loadPets();
    this.generateCalendar(); // 重新生成日历以更新喂食标记
  },

  loadPets() {
    try {
      const pets = wx.getStorageSync('pets') || [];
      this.setData({ pets });
    } catch (e) {
      console.error('加载宠物信息失败', e);
    }
  },

  loadFeedingRecords() {
    try {
      const feedingRecords = wx.getStorageSync('feedingRecords') || {};
      this.setData({ feedingRecords });
    } catch (e) {
      console.error('加载喂食记录失败', e);
    }
  },

  generateCalendar() {
    const { year, month, feedingRecords } = this.data;
    
    // 获取当月第一天是星期几
    const firstDay = new Date(year, month - 1, 1).getDay();
    
    // 获取当月天数
    const daysInMonth = new Date(year, month, 0).getDate();
    
    // 获取上个月天数
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const daysInPrevMonth = new Date(prevYear, prevMonth, 0).getDate();
    
    const calendarData = [];
    
    // 填充上个月的日期
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const dateStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      calendarData.push({
        day: day,
        isCurrentMonth: false,
        dateStr: dateStr,
        hasFeedingRecord: !!feedingRecords[dateStr]
      });
    }
    
    // 填充当月的日期
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      calendarData.push({
        day: day,
        isCurrentMonth: true,
        dateStr: dateStr,
        hasFeedingRecord: !!feedingRecords[dateStr],
        isToday: this.isToday(year, month, day)
      });
    }
    
    // 填充下个月的日期，确保日历有42个格子（6行7列）
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    let nextDay = 1;
    while (calendarData.length < 42) {
      const dateStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(nextDay).padStart(2, '0')}`;
      calendarData.push({
        day: nextDay,
        isCurrentMonth: false,
        dateStr: dateStr,
        hasFeedingRecord: !!feedingRecords[dateStr]
      });
      nextDay++;
    }
    
    this.setData({ calendarData });
  },

  isToday(year, month, day) {
    const today = new Date();
    return year === today.getFullYear() && 
           month === today.getMonth() + 1 && 
           day === today.getDate();
  },

  onDateTap(e) {
    const { datestr } = e.currentTarget.dataset;
    const { feedingRecords, pets } = this.data;
    
    const dayRecords = feedingRecords[datestr] || {};
    const selectedDateRecords = [];
    
    // 整理当天的喂食记录
    pets.forEach(pet => {
      const petRecords = dayRecords[pet.id] || [];
      if (petRecords.length > 0) {
        selectedDateRecords.push({
          petName: pet.name,
          petAvatar: pet.avatar,
          records: petRecords,
          totalFeedings: petRecords.length,
          maxFeedings: pet.maxFeedingsPerDay
        });
      }
    });
    
    this.setData({
      selectedDate: datestr,
      selectedDateRecords: selectedDateRecords
    });
  },

  closeDetailModal() {
    this.setData({
      selectedDate: null,
      selectedDateRecords: []
    });
  },

  formatDate(dateStr) {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekDay = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()];
    return `${month}月${day}日 星期${weekDay}`;
  },

  prevMonth() {
    let { year, month } = this.data;
    month--;
    if (month < 1) {
      month = 12;
      year--;
    }
    this.setData({ year, month });
    this.generateCalendar();
  },

  nextMonth() {
    let { year, month } = this.data;
    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
    this.setData({ year, month });
    this.generateCalendar();
  }
})