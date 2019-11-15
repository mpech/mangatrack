let fixtures = {
    'http://mangatrackapi/mangas':[
        {nameId:'the great sorcerer', name:'the great sorcerer will never die but maybe still', lastNum:10, updatedAt:Date.now()-300*1000, thumbUrl:'https://avt.mkklcdnv3.com/avatar_225_new/183-ul918778.jpg', links:{self:"http://mangatrackapi/mangas/a"}}, 
        {nameId:'some wizardry', name:'some wizardry', lastNum:15, updatedAt: Date.now()-3600*2000, thumbUrl:'https://images02.military.com/sites/default/files/styles/full/public/media/veteran-jobs/content-images/2016/03/chucknorris.jpg?itok=_J3M4O-S', links:{self:"/mangas/b"}},

        {nameId:'the great sorcerera', name:'the great sorcerer', lastNum:10, updatedAt:Date.now()-24*3600*1000, thumbUrl:'https://avt.mkklcdnv3.com/avatar_225_new/183-ul918778.jpg', links:{self:"/mangas/a"}}, 
        {nameId:'some wizardrya', name:'some wizardry', lastNum:15, updatedAt: Date.now()-2*24*3600*1000, thumbUrl:'https://avt.mkklcdnv3.com/avatar_225_new/1475-vr920072.jpg', links:{self:"/mangas/b"}},

        {nameId:'the great sorcererb', name:'the great sorcerer', lastNum:10, updatedAt:Date.now()-15*24*3600*1000, thumbUrl:'https://avt.mkklcdnv3.com/avatar_225_new/183-ul918778.jpg', links:{self:"/mangas/a"}}, 
        {nameId:'some wizardryb', name:'some wizardry', lastNum:15, updatedAt: Date.now(), thumbUrl:'https://avt.mkklcdnv3.com/avatar_225_new/1475-vr920072.jpg', links:{self:"/mangas/b"}},

        {nameId:'the great sorcererc', name:'the great sorcerer', lastNum:10, updatedAt:Date.now(), thumbUrl:'https://avt.mkklcdnv3.com/avatar_225_new/183-ul918778.jpg', links:{self:"/mangas/a"}}, 
        {nameId:'some wizardryc', name:'some wizardry', lastNum:15, updatedAt: Date.now(), thumbUrl:'https://avt.mkklcdnv3.com/avatar_225_new/1475-vr920072.jpg', links:{self:"/mangas/b"}},

        {nameId:'the great sorcererd', name:'the great sorcerer', lastNum:10, updatedAt:Date.now(), thumbUrl:'https://avt.mkklcdnv3.com/avatar_225_new/183-ul918778.jpg', links:{self:"/mangas/a"}}, 
        {nameId:'some wizardryd', name:'some wizardry', lastNum:15, updatedAt: Date.now(), thumbUrl:'https://avt.mkklcdnv3.com/avatar_225_new/1475-vr920072.jpg', links:{self:"/mangas/b"}}
    ],
    'http://mangatrackapi/mangas/the great sorcerer/chapters':[
        {name:'almost dead '+Date.now(), num:5, read: 0,url:'/outthere'},
        {name:'need food', num:4, read: 1},
        {name:'some growth', num:3, read: 1},
        {name:'some heroic initiation', num:2.5, read: 1}
    ]
}
export {fixtures}