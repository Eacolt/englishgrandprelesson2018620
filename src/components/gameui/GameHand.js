import $ from 'jquery'

class GameHand {
  static hand = null;
  static locked = false;
  static animateTicker = null;
  static animateIndex = 0;

  static init() {
    if (GameHand.hand) return;

    var handsArr = [
      $('<img src="static/img/hand1.png" />'),
      $('<img src="static/img/hand2.png" />'),
      $('<img src="static/img/hand3.png" />'),
      $('<img src="static/img/hand4.png" />')
    ]
    handsArr.forEach((item)=>{
      item.css({
        position:'absolute',
        width:'0.9rem',
        height:'0.9rem',
        left:'-0.25rem',
        top:'-0.2rem',
        display:'block'
      })
    })

    GameHand.hand = $('<div></div>');
    $(GameHand.hand).css({
      position: 'absolute',
      width: '.9rem',
      height: '.9rem',
      zIndex: 999999,
      top: '-6rem',
      left: '0',
      visibility:'hidden',
      pointerEvents: 'none',
      transformOrigin: 'center center'
    });
    GameHand.hand.append(handsArr[0]);
    GameHand.hand.append(handsArr[1]);
    GameHand.hand.append(handsArr[2]);
    GameHand.hand.append(handsArr[3]);

    document.getElementsByTagName('body')[0].appendChild(GameHand.hand.get(0));
    document.getElementById('app').addEventListener('mousemove', (e) => {

      GameHand.hand.css({
        left: e.pageX + 'px',
        top: e.pageY + 'px'
      })

    })
  }
  static setStepAnimation($index){
    if (GameHand.locked) {
      if (GameHand.animateTicker) {
        clearInterval(GameHand.animateTicker);
      }
      return;
    }
    Array.prototype.forEach.call(GameHand.hand.children(),(item)=>{
      $(item).css({
        opacity:0
      })
    });
    $(GameHand.hand.children().get($index)).css({
      opacity:1
    })
  }

  static setAnimation($type) {
    if (GameHand.locked) {
      if (GameHand.animateTicker) {
        clearInterval(GameHand.animateTicker);
      }
      return;


    }

    var aniState = undefined;
    var aniIndex = 0;
    switch ($type) {
      case 'click':

        GameHand.animateIndex = 0;
        if (GameHand.animateTicker) {
          clearInterval(GameHand.animateTicker);
        }
        GameHand.animateTicker = setInterval(() => {
          if (GameHand.animateIndex >= 2) {
            GameHand.animateIndex = 0;
          }

          Array.prototype.forEach.call(GameHand.hand.children(),(item)=>{
            $(item).css({
              opacity:0
            })
          });
          $(GameHand.hand.children().get(GameHand.animateIndex)).css({
            opacity:1
          })
          GameHand.animateIndex++;
        }, 400);

        break;
      case 'swipe':
       // let imgarrs2 = ['static/img/hand3.png', 'static/img/hand4.png'];
        GameHand.animateIndex = 2;
        if (GameHand.animateTicker) {
          clearInterval(GameHand.animateTicker);
        }
        GameHand.animateTicker = setInterval(() => {
          if (GameHand.animateIndex >= 4) {
            GameHand.animateIndex = 2;
          }

          Array.prototype.forEach.call(GameHand.hand.children(),(item)=>{
            $(item).css({
              opacity:0
            })
          });
          $(GameHand.hand.children().get(GameHand.animateIndex)).css({
            opacity:1
          })
          GameHand.animateIndex++;
        }, 400);


        break;
      case 'normal':
        GameHand.animateIndex = 0;
        if (GameHand.animateTicker) {
          clearInterval(GameHand.animateTicker);
        }

        Array.prototype.forEach.call(GameHand.hand.children(),(item)=>{
          $(item).css({
            opacity:0
          })
        });
        $(GameHand.hand.children().get(0)).css({
          opacity:1
        })
       // $(GameHand.hand).find('img').attr('src', 'static/img/hand1.png')


        break;
      default:
        break;
    }

  }
}

export default GameHand;
