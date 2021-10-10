// 定義遊戲狀態
const GSME_STATE = {
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardMatchFailed: 'CardMatchFailed',
  CardMatched: 'CardMatched',
  GameFinished: 'GameFinished',
}

// 卡片花色
const symbols = [
  'https://image.flaticon.com/icons/svg/105/105223.svg', // 黑桃 0-12
  'https://image.flaticon.com/icons/svg/105/105220.svg', // 愛心 13-25
  'https://image.flaticon.com/icons/svg/105/105212.svg', // 方塊 26-38
  'https://image.flaticon.com/icons/svg/105/105219.svg' // 梅花 39-51
]

// 和介面有關
const view = {
  // 負責生成卡片背面
  getCardElement(index){
    return `<div data-index="${index}" class="card back"></div>`
  },

  // 負責生成卡片內容，包括花色和數字
  getCardContent(index){
    const number = this.transformNumber((index % 13) + 1)
    const symbol = symbols[Math.floor(index / 13)]
    return `
    <p>${number}</p>
    <img src="${symbol}" alt="黑桃">
    <p>${number}</p>
    `
  },

  // 轉換數字
  transformNumber(number){
    switch (number) {
      case 1 :
        return "A"
      case 11 :
        return "J"
      case 12 :
        return "Q"
      case 13 :
        return "K"
      default :
        return number
    }
  },

  // 負責選出 #cards 並抽換內容
  displayCards: function displayCards(indexs){
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexs.map(index => {
      return this.getCardElement(index)
    }).join("")
  },
  
  // 翻牌
  flipCards(...card){
    card.map(card => {
      // 回傳正面
      if (card.classList.contains("back")){ 
        card.classList.remove("back")
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }
      // 回傳背面
      card.classList.add("back")
      card.innerHTML = ""
    })
  },
  
  // 卡片配對成功樣式
  pairCards(...card){
    card.map(card => {
      card.classList.add("paired", "a")
    })
  },

  renderScore(score){
    document.querySelector('.score').innerHTML = `Score: ${score}`
  },
  
  renderTriedTimes(times){
    document.querySelector('.tried').innerHTML = `Yor've tried: ${times} times`
  },

  appendWrongAnimation(...card){
    card.map(card => {
      card.classList.add("wrong")
      card.addEventListener("animationend", event => {
        event.target.classList.remove("wrong"), { once: true} 
      })
    })
  },

  showGameFinished(){
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <h1>Complete!</h1>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}

// 和資料有關
const model = {
  // 翻開的卡片
  revealedCards: [],
  // 卡片是否相同
  isRevealedCardsMatched(){
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },

  // 分數
  score: 0,
  
  // 試了幾次
  triedTimes: 0,
}

// 和流程有關
const controller = {
  // 當前的狀態
  currenState: GSME_STATE.FirstCardAwaits,
  // 產生卡片
  generateCards(){
    view.displayCards(utility.getRandomNumberArray(52))
  },
  // 依照遊戲狀態做不同的事情
  dispatchCardAction(card){
    if (!card.classList.contains("back")){
      return
    }
    switch (this.currenState) {
      case GSME_STATE.FirstCardAwaits:
        view.renderTriedTimes(++model.triedTimes)
        this.currenState = GSME_STATE.SecondCardAwaits
        view.flipCards(card)
        model.revealedCards.push(card)
        break
      case GSME_STATE.SecondCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        // 判斷配對是否成功
        if (model.isRevealedCardsMatched()){
          // 配對成功
          view.renderScore(model.score += 10)
          this.currenState = GSME_STATE.CardMatched
          view.pairCards(...model.revealedCards)
          model.revealedCards = []
          this.currenState = GSME_STATE.FirstCardAwaits
          if (model.score === 260){
            this.currenState = GSME_STATE.GameFinished
            view.showGameFinished()
          }
        } else {
          // 配對失敗
          this.currenState = GSME_STATE.CardMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          // 計時器
          setTimeout(this.resetCards, 1000)
        }
        break
    }
  },

  // 自動翻回牌背
  resetCards(){
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currenState = GSME_STATE.FirstCardAwaits
  }
}

// 演算法工具 
const utility = {
  // 拿亂數的陣列
  getRandomNumberArray(count){
    // 產生陣列數字
    const number = Array.from(Array(count).keys())
    // 洗牌
    for (let index = number.length - 1; index > 0 ; index--){
      const randomIndex = Math.floor(Math.random() * (index + 1))
      ;[number[index], number[randomIndex]] = [ number[randomIndex], number[index]]
    }
    return number
  }
}

controller.generateCards()

document.querySelectorAll(".card").forEach(card => {
  card.addEventListener("click", (event) => {
    controller.dispatchCardAction(card)
  })
})