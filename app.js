// 重试次数

let fetchReslut = (() => {
    var _ref = _asyncToGenerator(function* () {
        // let beginPageHtml = null;
        let resultPageHtml = null;

        if (!watchNames.length) {
            logger.error('参数丢失，请在命令后面跟上需要关注的楼盘名称');
            return;
        }

        try {
            // beginPageHtml = await superagent.get(beginPage).timeout(TIMEOUT);
            resultPageHtml = yield superagent.get(resultPage).timeout(TIMEOUT);
        } catch (err) {
            logger.error(err);

            if (retry) {
                setTimeout(fetchReslut, 3000);
                retry--;
            } else {
                logger.info('访问住建委网站失败');
                msgSend('访问住建委网站失败！', `服务器君试了${ retry }次都没有成功`);
                return;
            }
        }

        // let beginDom = cheerio.load(beginPageHtml.text);
        let resultDom = cheerio.load(resultPageHtml.text);

        // let beginList = beginDom('a', listId);
        let resultList = resultDom('a', listId);

        // beginList.each((idx, item) => {
        //     let title = beginDom(item).text();
        //     watchNames.map((name, idx) => {
        //         if (title.indexOf(name) !== -1) {
        //             console.log(`${title} 已经开始摇号了`);
        //         }
        //     });
        // });

        resultList.each(function (idx, item) {
            let title = resultDom(item).text();
            let link = resultDom(item).attr('href');
            watchNames.map(function (name, idx) {
                if (title.indexOf(name) !== -1) {
                    msgSend(`摇号结果出来了`, `**${ title }** ${ HOST }${ link }`);
                }
            });
        });
    });

    return function fetchReslut() {
        return _ref.apply(this, arguments);
    };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const cheerio = require('cheerio');
const superagent = require('superagent');
const log4js = require('log4js');

log4js.configure({
    appenders: [{
        type: 'console'
    }, {
        type: 'file',
        filename: 'access.log',
        maxLogSize: 1024 * 100,
        backups: 4
    }],
    replaceConsole: true
});

logger = log4js.getLogger('normal');

let argv = process.argv;
argv.shift();
argv.shift();

const watchNames = argv;
logger.info(watchNames);
// const watchNames = ['富兴鹏城', '金隅汇景苑（20号楼）'];
const TIMEOUT = 20000;
const HOST = 'http://www.bjjs.gov.cn';
// const beginPage = HOST + '/tabid/1072/MoreModuleID/10416/MoreTabID/4021/Default.aspx';
const resultPage = HOST + '/tabid/1072/MoreModuleID/10417/MoreTabID/4021/Default.aspx';
const listId = '#ess_ctr9680_ListC_Info_LstC_Info';

let retry = 5;

function msgSend(title, content) {
    let key = require('./config.js').key;
    let uri = `http://sc.ftqq.com/${ key }.send`;
    console.log(uri);
    superagent.get(uri).query({ text: title, desp: content }).end((err, res) => {
        let data = JSON.parse(res.text);

        if (err) {
            logger.error(`消息推送失败：${ err }`);
        } else if (data.errno) {
            logger.error(`消息推送失败：${ data.errmsg }`);
        } else {
            logger.info(`推送消息成功: ${ content }`);
        }
    });
}

msgSend('哇哈哈', 'bababa');
// fetchReslut();

//# sourceMappingURL=app.js.map