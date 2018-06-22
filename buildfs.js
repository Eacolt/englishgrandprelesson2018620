var fs = require("fs");
var path = require("path");
var preparation = require('./static/preparation.json');
var routerList = [];
var importContent = [];
var assetsModules = [];//所有需要的资源路径目录;
importContent.push('import boot from "@/components/boot.vue";');
importContent.push('import indexpage from "@/components/indexpage.vue";');
routerList.push('{path:"/",name:"boot",component:boot}');
routerList.push('{path:"/index/",name:"index",component:indexpage}');


// assetsModules.push('themetypeui');

for (let i = 0; i < preparation.menus.length; i++) {
  if (preparation.menus[i].menus && preparation.menus[i].name) {
    var routerChildrens = "";
    var router = '{' +
      'path:' + '\"/index/' + preparation.menus[i].name + '\",' +

      'component:' + 'choiceInterfaceRoot' + ',' +
      'meta:{ assetsUrl: \"' + preparation.menus[i].pageResourceId + '\"},children:[';


    let importDesp_choice = 'import ' + preparation.menus[i].pageModuleId + ' from ' + '\"@/components/' + preparation.menus[i].pageModuleId + '.vue\";';
    let choiceInterfaceRoot_import = 'import choiceInterfaceRoot from ' + '\"@/components/' + 'choiceInterfaceRoot.vue\";';
    if (importContent.indexOf(importDesp_choice) == -1) {
      importContent.push(importDesp_choice)
    }
    if (assetsModules.indexOf(preparation.menus[i].pageResourceId) == -1) {
      assetsModules.push(preparation.menus[i].pageResourceId)
    }
    ;
    /**
     * @导入基子路由index模板choiceInterfaceRoot
     */
    if (importContent.indexOf(choiceInterfaceRoot_import) == -1) {
      importContent.push(choiceInterfaceRoot_import)
    }

    for (let k = 0; k < preparation.menus[i].menus.length; k++) {
      var routers_children = '{' +
        'path:' + '\"' + preparation.menus[i].menus[k].name + '\",' +
        'name:"' + preparation.menus[i].name + '-' + i + '-' + k + '",' +
        'component:' + preparation.menus[i].menus[k].pageModuleId + ',' +
        'meta:{ assetsUrl: \"' + preparation.menus[i].menus[k].pageResourceId + '\",completed:0}},';
      let importDesp = 'import ' + preparation.menus[i].menus[k].pageModuleId + ' from ' + '\"@/components/' + preparation.menus[i].menus[k].pageModuleId + '.vue\";';
      if (importContent.indexOf(importDesp) == -1) {
        importContent.push(importDesp)
      }
      if (assetsModules.indexOf(preparation.menus[i].menus[k].pageResourceId) == -1) {
        assetsModules.push(preparation.menus[i].menus[k].pageResourceId)
      }
      routerChildrens += routers_children;
    }
    /**
     *
     * @引入子路由根模板-choiceInterface
     */
    // let bootPage = '{' +
    //   'path:' + '\"/\",' +
    //   'name:"childs-'+preparation.menus[i].name + '-'  + i + '",' +
    //   'component:' + preparation.menus[i].pageModuleId + ',' +
    //   'meta:{ assetsUrl: \"' + preparation.menus[i].pageResourceId + '\"}},';

    let first_children = '{' +
      'path:' + '\"/\",' +
      'name:"childs-'+preparation.menus[i].name + '-'  + i + '",' +
      'component:' + preparation.menus[i].pageModuleId + ',' +
      'meta:{ assetsUrl: \"' + preparation.menus[i].pageResourceId + '\"}},';
    router += first_children + routerChildrens + ']}';

    routerList.push(router);

  }

}
var baseImports = "import Vue from 'vue';import Router from 'vue-router';" +
  importContent.join('') + "Vue.use(Router);";
var newRouters = `export default new Router({
  routes:[ ` + routerList.join(',') + `]
})`;
var routerStructor = baseImports + newRouters;

assetsModules.forEach((mainItem) => {

  //移除模板;
  if (fs.existsSync('./static/' + mainItem)) {
    var subfilesCopyed = fs.readdirSync('./static/' + mainItem);
    if (subfilesCopyed.length > 0) {
      subfilesCopyed.forEach((items, indexs) => {
        //批量删除资源目录中所有文件
        fs.unlinkSync('./static/' + mainItem + '/' + items);
      });
    }
    fs.rmdirSync('./static/' + mainItem);
  }
});
//创建模板;
assetsModules.forEach((mainItem,index) => {
  var name = './englishmodules/' + mainItem;
  var subfiles = fs.readdirSync(name);
  var copyedFiles = subfiles.filter((item) => {
    let rootUrl = name + '/' + item;
    if (fs.statSync(rootUrl).isFile()) {

      return rootUrl
    }
  });
  // console.log(mainItem)


  fs.mkdirSync('./static/' + mainItem);
  copyedFiles.forEach((items) => {
    copyIt('./englishmodules/' + mainItem + '/' + items, './static/' + mainItem + '/' + items)
  });
  if(index==0){
    copyTheme();
  }

})

function copyIt(src, dst) {
  fs.createReadStream(src).pipe(fs.createWriteStream(dst));
}
function getPureStr($str){
  let dotpos,result,indexpos;
  let regs = new RegExp('_','g');
  dotpos = $str.search(/\./g);
  while ((result=regs.exec($str))!=null){
    indexpos = regs.lastIndex;
  }
  return $str.substr(indexpos-1,dotpos-indexpos+1);
}
function copyTheme() {
  var mtype = preparation.themeType;

  if (fs.existsSync('./static/themetypeui')) {
    var subfilesCopyed = fs.readdirSync('./static/themetypeui');
    if (subfilesCopyed.length > 0) {
      subfilesCopyed.forEach((items, indexs) => {
        //批量删除资源目录中所有文件
        fs.unlinkSync('./static/themetypeui/'+items);
      });
    }
    fs.rmdirSync('./static/themetypeui');
  }

    fs.mkdirSync('./static/themetypeui');
  //复制小怪物；
  preparation.menus.forEach((item)=>{
    //console.log('是什么：',item.name)
    switch (item.name){
      case 'song':
        copyIt('./englishmodules/themetypeui/monster1_song.atlas','./static/themetypeui/monster1_song.atlas');
        copyIt('./englishmodules/themetypeui/monster1_song.json','./static/themetypeui/monster1_song.json');
        copyIt('./englishmodules/themetypeui/monster1_song.png','./static/themetypeui/monster1_song.png')

        break;
      case 'vocabulary':
        copyIt('./englishmodules/themetypeui/monster2_vocabulary.atlas','./static/themetypeui/monster2_vocabulary.atlas');
        copyIt('./englishmodules/themetypeui/monster2_vocabulary.json','./static/themetypeui/monster2_vocabulary.json');
        copyIt('./englishmodules/themetypeui/monster2_vocabulary.png','./static/themetypeui/monster2_vocabulary.png')

        break;
      case 'sentences':
        copyIt('./englishmodules/themetypeui/monster3_sentences.atlas','./static/themetypeui/monster3_sentences.atlas');
        copyIt('./englishmodules/themetypeui/monster3_sentences.json','./static/themetypeui/monster3_sentences.json');
        copyIt('./englishmodules/themetypeui/monster3_sentences.png','./static/themetypeui/monster3_sentences.png')
        break;
      case 'story':
        copyIt('./englishmodules/themetypeui/monster4_story.atlas','./static/themetypeui/monster4_story.atlas');
        copyIt('./englishmodules/themetypeui/monster4_story.json','./static/themetypeui/monster4_story.json');
        copyIt('./englishmodules/themetypeui/monster4_story.png','./static/themetypeui/monster4_story.png')
        break;
      case 'grammar':
        copyIt('./englishmodules/themetypeui/monster5_grammar.atlas','./static/themetypeui/monster5_grammar.atlas');
        copyIt('./englishmodules/themetypeui/monster5_grammar.json','./static/themetypeui/monster5_grammar.json');
        copyIt('./englishmodules/themetypeui/monster5_grammar.png','./static/themetypeui/monster5_grammar.png')
        break;
        break;
      case 'text':
        copyIt('./englishmodules/themetypeui/monster6_text.atlas','./static/themetypeui/monster6_text.atlas');
        copyIt('./englishmodules/themetypeui/monster6_text.json','./static/themetypeui/monster6_text.json');
        copyIt('./englishmodules/themetypeui/monster6_text.png','./static/themetypeui/monster6_text.png')
        break;
      case 'ketpet':
        copyIt('./englishmodules/themetypeui/monster7_ketpet.atlas','./static/themetypeui/monster7_ketpet.atlas');
        copyIt('./englishmodules/themetypeui/monster7_ketpet.json','./static/themetypeui/monster7_ketpet.json');
        copyIt('./englishmodules/themetypeui/monster7_ketpet.png','./static/themetypeui/monster7_ketpet.png')
        break;
      default:
        break;
    }
  })

    if(mtype==1){



      let files = [

        'menusTrumpet_pink.json',
        'menusTrumpet_pink.png',
        'practiceTrumpet_pink.json',
        'practiceTrumpet_pink.png',


        'choicebg_pink.jpg',
        'ground_pink.jpg',
        'indexback1_pink.png',
        'table_pink.png',
        'table1_pink.png',
        'back2ground_pink.png',

        'back_pink.png',
        'book_pink.png',
        'close_pink.png',
        'home_pink.png',
        'key_pink.png',
        'keyborder_pink.png',
        'keylight_pink.png',

        //全图轮播:
        'backbg_pink.jpg',
        'pagination_pink.png',
        //选文
        'textchoose_normal_pink.png',
        'textchoose_select_pink.png',
        'textchoose1_back_pink.png',
        'textchoose1_close1_pink.png',
        'textchoose1_close2_pink.png',
        'textchoose2_back_pink.png',
        'textchoose2_close1_pink.png',
        'textchoose2_close2_pink.png',
        'timeback_pink.png',
        'timekey_pink.png',
        'timeline_pink.png',

        //选图片：
        'cardchoose_doorL_pink.png',
        'cardchoose_doorR_pink.png',
        'cardchoose_normal_pink.png',
        'cardchoose_select_pink.png',
        'practicebg_pink.jpg',
        'timeback_pink.png',
        'timekey_pink.png',
        'timeline_pink.png',

        //电影
        'goplaybtn_pink.png',
        'pausebtn_pink.png',
        'playbtn_pink.png',
        'videobg_pink.png'
      ];
      files.forEach((item,index)=>{
        let aftername = '.'+item.split('.')[1];
        let newname = item.replace(getPureStr(item),'');
        copyIt('./englishmodules/themetypeui/'+item,'./static/themetypeui/'+newname)
      });

    }
    else if(mtype==2){
      let files = [

        'menusTrumpet_yellow.json',
        'menusTrumpet_yellow.png',
        'practiceTrumpet_yellow.json',
        'practiceTrumpet_yellow.png',


        'choicebg_yellow.jpg',
        'ground_yellow.jpg',
        'indexback1_yellow.png',
        'table_yellow.png',
        'table1_yellow.png',
        'back2ground_yellow.png',

        'back_yellow.png',
        'book_yellow.png',
        'close_yellow.png',
        'home_yellow.png',
        'key_yellow.png',
        'keyborder_yellow.png',
        'keylight_yellow.png',

        //全图轮播:
        'backbg_yellow.jpg',
        'pagination_yellow.png',
        //选文
        'textchoose_normal_yellow.png',
        'textchoose_select_yellow.png',
        'textchoose1_back_yellow.png',
        'textchoose1_close1_yellow.png',
        'textchoose1_close2_yellow.png',
        'textchoose2_back_yellow.png',
        'textchoose2_close1_yellow.png',
        'textchoose2_close2_yellow.png',
        'timeback_yellow.png',
        'timekey_yellow.png',
        'timeline_yellow.png',

        //选图片：
        'cardchoose_doorL_yellow.png',
        'cardchoose_doorR_yellow.png',
        'cardchoose_normal_yellow.png',
        'cardchoose_select_yellow.png',
        'practicebg_yellow.jpg',
        'timeback_yellow.png',
        'timekey_yellow.png',
        'timeline_yellow.png',

        //电影
        'goplaybtn_yellow.png',
        'pausebtn_yellow.png',
        'playbtn_yellow.png',
        'videobg_yellow.png'
      ];
      files.forEach((item,index)=>{
        let aftername = '.'+item.split('.')[1];
        let newname = item.replace(getPureStr(item),'');
        copyIt('./englishmodules/themetypeui/'+item,'./static/themetypeui/'+newname)
      });

    }
  else if(mtype==3){
    let files = [

      'menusTrumpet_green.json',
      'menusTrumpet_green.png',
      'practiceTrumpet_green.json',
      'practiceTrumpet_green.png',
      'choicebg_green.jpg',
      'ground_green.jpg',
      'indexback1_green.png',
      'table_green.png',
      'table1_green.png',
      'back2ground_green.png',

      'back_green.png',
      'book_green.png',
      'close_green.png',
      'home_green.png',
      'key_green.png',
      'keyborder_green.png',
      'keylight_green.png',

      //全图轮播:
      'backbg_green.jpg',
      'pagination_green.png',
      //选文
      'textchoose_normal_green.png',
      'textchoose_select_green.png',
      'textchoose1_back_green.png',
      'textchoose1_close1_green.png',
      'textchoose1_close2_green.png',
      'textchoose2_back_green.png',
      'textchoose2_close1_green.png',
      'textchoose2_close2_green.png',
      'timeback_green.png',
      'timekey_green.png',
      'timeline_green.png',

      //选图片：
      'cardchoose_doorL_green.png',
      'cardchoose_doorR_green.png',
      'cardchoose_normal_green.png',
      'cardchoose_select_green.png',
      'practicebg_green.jpg',
      'timeback_green.png',
      'timekey_green.png',
      'timeline_green.png',

      //电影
      'goplaybtn_green.png',
      'pausebtn_green.png',
      'playbtn_green.png',
      'videobg_green.png'
    ];

    files.forEach((item,index)=>{
      let aftername = '.'+item.split('.')[1];
      let newname = item.replace(getPureStr(item),'');
      copyIt('./englishmodules/themetypeui/'+item,'./static/themetypeui/'+newname)
    });


  }
    else if(mtype==4){
      let files = [

        'menusTrumpet_blue.json',
        'menusTrumpet_blue.png',
        'practiceTrumpet_blue.json',
        'practiceTrumpet_blue.png',


        'choicebg_blue.jpg',
        'ground_blue.jpg',
        'indexback1_blue.png',
        'table_blue.png',
        'table1_blue.png',
        'back2ground_blue.png',

        'back_blue.png',
        'book_blue.png',
        'close_blue.png',
        'home_blue.png',
        'key_blue.png',
        'keyborder_blue.png',
        'keylight_blue.png',

        //全图轮播:
        'backbg_blue.jpg',
        'pagination_blue.png',
        //选文
        'textchoose_normal_blue.png',
        'textchoose_select_blue.png',
        'textchoose1_back_blue.png',
        'textchoose1_close1_blue.png',
        'textchoose1_close2_blue.png',
        'textchoose2_back_blue.png',
        'textchoose2_close1_blue.png',
        'textchoose2_close2_blue.png',
        'timeback_blue.png',
        'timekey_blue.png',
        'timeline_blue.png',

        //选图片：
        'cardchoose_doorL_blue.png',
        'cardchoose_doorR_blue.png',
        'cardchoose_normal_blue.png',
        'cardchoose_select_blue.png',
        'practicebg_blue.jpg',
        'timeback_blue.png',
        'timekey_blue.png',
        'timeline_blue.png',

        //电影
        'goplaybtn_blue.png',
        'pausebtn_blue.png',
        'playbtn_blue.png',
        'videobg_blue.png'
      ];

      files.forEach((item,index)=>{
        let aftername = '.'+item.split('.')[1];
        let newname = item.replace(getPureStr(item),'');
        copyIt('./englishmodules/themetypeui/'+item,'./static/themetypeui/'+newname)
      });


    }
    else if(mtype==5){
      let files = [

        'menusTrumpet_purple.json',
        'menusTrumpet_purple.png',
        'practiceTrumpet_purple.json',
        'practiceTrumpet_purple.png',


        'choicebg_purple.jpg',
        'ground_purple.jpg',
        'indexback1_purple.png',
        'table_purple.png',
        'table1_purple.png',
        'back2ground_purple.png',

        'back_purple.png',
        'book_purple.png',
        'close_purple.png',
        'home_purple.png',
        'key_purple.png',
        'keyborder_purple.png',
        'keylight_purple.png',

        //全图轮播:
        'backbg_purple.jpg',
        'pagination_purple.png',
        //选文
        'textchoose_normal_purple.png',
        'textchoose_select_purple.png',
        'textchoose1_back_purple.png',
        'textchoose1_close1_purple.png',
        'textchoose1_close2_purple.png',
        'textchoose2_back_purple.png',
        'textchoose2_close1_purple.png',
        'textchoose2_close2_purple.png',
        'timeback_purple.png',
        'timekey_purple.png',
        'timeline_purple.png',

        //选图片：
        'cardchoose_doorL_purple.png',
        'cardchoose_doorR_purple.png',
        'cardchoose_normal_purple.png',
        'cardchoose_select_purple.png',
        'practicebg_purple.jpg',
        'timeback_purple.png',
        'timekey_purple.png',
        'timeline_purple.png',

        //电影
        'goplaybtn_purple.png',
        'pausebtn_purple.png',
        'playbtn_purple.png',
        'videobg_purple.png'
      ];

      files.forEach((item,index)=>{
        let aftername = '.'+item.split('.')[1];
        let newname = item.replace(getPureStr(item),'');
        copyIt('./englishmodules/themetypeui/'+item,'./static/themetypeui/'+newname)
      });


    }

    if(mtype==2){
    let files = [
      'tabletext_yellow.json',
      'tabletext_yellow.png'

    ]

      files.forEach((item,index)=>{
        let aftername = '.'+item.split('.')[1];
        let newname = item.replace(getPureStr(item),'');
        copyIt('./englishmodules/themetypeui/'+item,'./static/themetypeui/'+newname)
      });
    }else{
      let files = [
        'tabletext_normal.json',
        'tabletext_normal.png'

      ]

      files.forEach((item,index)=>{
        let aftername = '.'+item.split('.')[1];
        let newname = item.replace(getPureStr(item),'');
        copyIt('./englishmodules/themetypeui/'+item,'./static/themetypeui/'+newname)
      });
    }
    console.log('node buildfs.....');
    console.log('预习编译成功…^_^');

}

fs.writeFile('./src/router/index.js', routerStructor, function (err) {
  if (err) {
    return console.error(err);
  }
  fs.readFile('./src/router/index.js', function (err, data) {
    if (err) {
      return console.error(err);
    }

  });
});

