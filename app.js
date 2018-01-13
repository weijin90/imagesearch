//requirements and instantiate
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const Bing = require('node-bing-api')({accKey: "1e9f43c80c144fb6bc6e5912dedf9d3e"});
const searchTerm = require('./models/searchTerm');

app.use(bodyParser.json());
app.use(cors());
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/searchTerms');
//search term
app.get('/api/recentsearches',(req,res,next)=>{
    searchTerm.find({}, (err,data)=>{
        res.json(data);
    });
});
//get call with required and non required params
app.get('/api/imagesearch/:searchVal*',(req,res,next)=>{
    var { searchVal } = req.params;
    var { offset } = req.query;

    var data = new searchTerm({
        searchVal, 
        searchDate: new Date()
    });
//save to search term collection
    data.save(err =>{
        if(err)
        {
            res.send("error saving to db");
        }
       
    })

var searchOffset;

//does offset
    if(offset){
        if(offset==1){
            offset=0;
            searchOffset=1;
        }
        else if(offset>1){
            searchOffset = offset + 1;
        }
    }

    Bing.images(searchVal, {
        top:(10*searchOffset),
        skip:(10*offset)
    },function(error,rez,body){
        var bingData = [];
        for(var i=0;i<10;i++){
            bingData.push({
                url: body.value[i].webSearchUrl,
                snippet: body.value[i],
                thumbnail: body.value[i].thumbnailUrl,
                context: body.value[i].hostPageDisplayUrl
            });
        }

        res.json(bingData);
    });

});



app.listen(process.env.PORT || 3000, ()=>{
    console.log("Server is online");
});