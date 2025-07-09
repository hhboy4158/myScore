// src/utlis/codeUtli.js



/**
 * 生成教室代碼, 有把一些容易混淆的字(包含但不限於: I, O, 1, 0)去掉, 
 * 不知道是不是多此一舉, 不過我不管
 * @return {string} code 
 */
exports.generateClassCode = (codeLength = 8) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 去掉易混淆字
  let code = '';
  for (let i = 0; i < codeLength; i++) {
    // 把隨機生成的 0 到 1 之間的浮點數乘上 chars 字串的長度
    // 得到一個介於 0 到 chars 字串長度（不包含最大值）之間的浮點數
    // 再把這個值丟給 Math.floor 把這個浮點數向下取整，變成一個整數
    // 這樣就可以用 charAt() 方法, 利用隨機的整數給 chars 定位, 取出 chars 裡的隨機一個字元
    // 最後用 for 迴圈 取 8 次 通通堆起來 回傳
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};