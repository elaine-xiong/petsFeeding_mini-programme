// // index.js
// const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

// Page({
//   data: {
//     motto: 'Hello World',
//     userInfo: {
//       avatarUrl: defaultAvatarUrl,
//       nickName: '',
//     },
//     hasUserInfo: false,
//     canIUseGetUserProfile: wx.canIUse('getUserProfile'),
//     canIUseNicknameComp: wx.canIUse('input.type.nickname'),
//   },
  
//   // 页面加载时检查用户是否存在
//   onLoad() {
//     this.checkUserExists();
//   },

//   // 检查用户是否已存在
//   checkUserExists() {
//     // 这里可以从本地存储获取 openid，实际项目中应该通过 wx.login 获取
//     const openid = wx.getStorageSync('openid') || null;
//     if (openid) {
//       this.fetchUserData(openid);
//     // } else {
//     //   // 如果没有 openid，则获取 code 并向后端请求 openid
//     //   this.getOpenid();
//     // }
//   }
// },

//   // // 获取 openid
//   // getOpenid() {
//   //   wx.login({
//   //     success: (res) => {
//   //       if (res.code) {
//   //         // 将 code 发送给后端以换取 openid
//   //         this.requestOpenid(res.code);
//   //       } else {
//   //         console.log('登录失败！' + res.errMsg);
//   //       }
//   //     }
//   //   });
//   // },

//   //  // 向后端请求 openid
//   // requestOpenid(code) {
//   //   wx.request({
//   //     url: 'http://192.168.1.121:3300/login', // 你需要在后端实现这个接口
//   //     method: 'POST',
//   //     data: {
//   //       code: code
//   //     },
//   //     success: (res) => {
//   //       if (res.data.success) {
//   //         // 保存 openid 到本地存储
//   //         wx.setStorageSync('openid', res.data.openid);
//   //         console.log('获取 openid 成功:', res.data.openid);
//   //       } else {
//   //         console.error('获取 openid 失败:', res.data.error);
//   //       }
//   //     },
//   //     fail: (err) => {
//   //       console.error("网络请求失败：", err);
//   //     }
//   //   });
//   // },

//   // 获取用户数据
//   fetchUserData(openid) {
//     wx.request({
//       url: 'http://192.168.1.121:3300/users', // 注意替换为你的实际 IP 地址
//       method: 'GET',
//       success: (res) => {
//         if (res.data.success) {
//           console.log("获取用户数据成功：", res.data.data);
//           // 处理获取到的用户数据
//         } else {
//           console.error("获取用户数据失败：", res.data.error);
//         }
//       },
//       fail: (err) => {
//         console.error("网络请求失败：", err);
//       }
//     });
//   },

//   bindViewTap() {
//     wx.navigateTo({
//       url: '../logs/logs'
//     })
//   },
  
//   onChooseAvatar(e) {
//     const { avatarUrl } = e.detail
//     const { nickName } = this.data.userInfo
//     this.setData({
//       "userInfo.avatarUrl": avatarUrl,
//       hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
//     })
//   },
  
//   onInputChange(e) {
//     const nickName = e.detail.value
//     const { avatarUrl } = this.data.userInfo
//     this.setData({
//       "userInfo.nickName": nickName,
//       hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
//     })
//   },
  
//   getUserProfile(e) {
//     // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
//     wx.getUserProfile({
//       desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
//       success: (res) => {
//         console.log(res)
//         this.setData({
//           userInfo: res.userInfo,
//           hasUserInfo: true
//         })
        
//         // 用户授权后，将用户信息发送到后端
//         this.registerUser(res.userInfo);
//       }
//     })
//   },
  
//   // 注册新用户
//   registerUser(userInfo) {
//     // 注意：这里需要真实的 openid，可以通过 wx.login 获取
//     // 这里为了演示使用临时值
//     const userData = {
//       //openid: 'temp_openid_' + Date.now(), // 实际应使用真实 openid
//       nickname: userInfo.nickName,
//       avatar_url: userInfo.avatarUrl
//     };
    
//     wx.request({
//       url: 'http://192.168.1.121:3300/users', // 注意替换为你的实际 IP 地址
//       method: 'POST',
//       data: userData,
//       success: (res) => {
//         if (res.data.success) {
//           console.log("用户注册成功：", res.data.message);
//           // 保存 openid 到本地存储
//           //wx.setStorageSync('openid', userData.openid);
//         } else {
//           console.error("用户注册失败：", res.data.error);
//         }
//       },
//       fail: (err) => {
//         console.error("网络请求失败：", err);
//       }
//     });
//   },
// })

// // Page({
// //   data: {
// //     userList: []
// //   },

// //   onLoad() {
// //     wx.request({
// //       url: 'http://192.168.1.121:3300/users',
// //       method: 'GET',
// //       success: (res) => {
// //         console.log('成功:', res)
// //         this.setData({
// //           userList: res.data.data   // 把 [] 存入页面状态里
// //         })
// //       },
// //       fail: (err) => {
// //         console.error('失败:', err)
// //       }
// //     })
// //   }
// // })


// index.js
const defaultAvatarUrl =
  'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
    motto: 'Hello World',
    userInfo: {
      avatarUrl: defaultAvatarUrl,
      nickName: ''
    },
    hasUserInfo: false,
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    canIUseNicknameComp: wx.canIUse('input.type.nickname')
  },

  /* ================= 页面加载 ================= */
  onLoad() {
    console.log('index 页面加载')
  },

  /* ================= 选择头像 ================= */
  onChooseAvatar(e) {
    const avatarUrl = e.detail.avatarUrl
    this.setData({
      'userInfo.avatarUrl': avatarUrl
    })
  },

  /* ================= 输入昵称 ================= */
  onInputChange(e) {
    const nickName = e.detail.value
    this.setData({
      'userInfo.nickName': nickName
    })
  },

  /* ================= 获取头像昵称（仅获取，不入库） ================= */
  getUserProfile() {
    wx.getUserProfile({
      desc: '用于登录展示',
      success: (res) => {
        console.log('获取用户信息成功', res.userInfo)
        this.setData({
          userInfo: res.userInfo
        })
      },
      fail: (err) => {
        console.error('获取用户信息失败', err)
      }
    })
  },

  /* ================= 完成登录（真正写数据库） ================= */
  login() {
    const { nickName, avatarUrl } = this.data.userInfo

    console.log('点击完成登录', this.data.userInfo)

    if (!nickName || !nickName.trim()) {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none'
      })
      return
    }

    if (!avatarUrl || avatarUrl === defaultAvatarUrl) {
      wx.showToast({
        title: '请选择头像',
        icon: 'none'
      })
      return
    }

    wx.request({
      url: 'http://192.168.1.121:3300/users',
      method: 'POST',
      data: {
        nickname: nickName,
        avatar_url: avatarUrl
      },
      success: (res) => {
        console.log('登录接口返回', res)

        if (res.data && res.data.success) {
          this.setData({
            hasUserInfo: true
          })

          wx.showToast({
            title: '登录成功',
            icon: 'success'
          })
        } else {
          wx.showToast({
            title: '登录失败',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        console.error('请求失败', err)
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
      }
    })
  },

  /* ================= 跳转日志页（原样保留） ================= */
  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  }
})
