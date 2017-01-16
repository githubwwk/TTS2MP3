var request = require('request'),
         fs = require('fs'),
       wait = require('wait.for'),
xlsxUtility = require('./xlsxUtility.js');


console.log('Start');

function genMp3File(fileTag, lang, text, callback)
{
      var server_url = 'http://soundoftext.com/sounds';

      //var lang = 'zh-TW';
      //var lang = 'en';
      //var text = "測試";
      //var text = "125 公分";
      //var text = "前方障礙物";

      var postData = 'text=' + encodeURIComponent(text) + '&lang=' + lang;

      console.log('Post Data:' + postData);

      var options = {
             method : 'post',
             body: postData,
             url: server_url,
             headers:
             {
               'Accept': '*/*',
      			   'Origin': 'http://soundoftext.com',
      			   'X-Requested-With': 'XMLHttpRequest',
      			   'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36',
      			   'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      			   'Referer':'http://soundoftext.com/',
      			   'Accept-Encoding': 'gzip, deflate',
      			   'Accept-Language': 'zh-TW,zh;q=0.8,en-US;q=0.6,en;q=0.4'
             }
      };

      var mp3_file_name = '';

      request(options, function (err, res, body) {
          
          if(err) {
          	console.log('[37] Error:' + err);
          	return;
          }

          var body_obj = JSON.parse(body);
          console.log("body_obj.id:" + body_obj.id);
          var get_mp3_file_name_url = 'http://soundoftext.com/sounds/' + body_obj.id;

          request.get(get_mp3_file_name_url).on('response', function (res) {

              res.on('data', function(chunk){
                  var strChunk = chunk.toString();
                  var check_pattern = '/static/sounds/' + lang + '/';
                  var pre_posi = strChunk.indexOf(check_pattern) + check_pattern.length;
                  var post_posi = -1;
                  if (pre_posi > -1)
                  {
                  	post_posi = strChunk.indexOf('.mp3', pre_posi);	
                  }

                  mp3_file_name = strChunk.substring(pre_posi, post_posi) + '.mp3';
                  var new_mp3_file_name = './mp3_result/' + fileTag + '_' + strChunk.substring(pre_posi, post_posi) + '_' + lang +'.mp3'
                  var decode_mp3_file_name = decodeURIComponent(new_mp3_file_name);
                  var download_mp3_url = 'http://soundoftext.com/static/sounds/' + lang + '/' + mp3_file_name;
                  request.get(download_mp3_url).on('response', function (res) {
                      var fws = fs.createWriteStream(decode_mp3_file_name);
                      res.pipe(fws);
                      res.on('end', function(){
                      	// gi ib with pro
                        console.log("Wirte file down:" + decode_mp3_file_name);
                        return callback();
                      }); /* res.on('end') */
                  }); /* request.get() */
              }); /* res.on('data') */
          }); /* request.get() */
      }); /* request(options) */  
} /* genMp3File */

function main()
{
   //var lang = 'zh-TW';
   //var text = "前方障礙物";
   //var result = wait.for(genMp3File, lang, text);
   function exe(callback)
   {
     //var textList = xlsxUtility.xlsx2json('textList.xlsx', 'list');
     var textList = xlsxUtility.xlsx2json('textList.xlsx', 'general');
     
     function PrefixInteger(num, length) {
        return (Array(length).join('0') + num).slice(-length);
     }

     for (item of textList)
     {   
        console.log("[id]:" + item[0]);
        console.log("[value]:" + item[1]);

        var fileTag = PrefixInteger(item[0], 4); 

        //console.log("[value]:" + textList[id]);
        var lang = 'zh-TW';    
        var text = item[1];
        var result = wait.for(genMp3File, fileTag, lang, text);
     }   
     return callback();
   }

   wait.launchFiber(exe, function(){}); 
}

main(); 