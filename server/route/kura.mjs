import Express from 'express'
import Path from 'node:path'
import Fs from 'node:fs'
import Busboy from 'busboy'
import {
  claim,
  naming,
  isNumeric,
  timing
} from '../etc.mjs'
import Project from './project.mjs'

const router=Express.Router()
const path='./public'
// const path='./kura'

router.route("/")
  .get((req,res)=>{
    res.send(Project.template('Kura','Working on it'))
  })

  .post((req,res)=>{
    const busboy=Busboy({headers:req.headers})
    busboy.on("file",(name,file,info)=>{
      const fileName=naming()+"_"+info.filename
      file.pipe(Fs.createWriteStream(Path.join(path,fileName)))
      file.on("close",()=>{
        res.json({fileName:fileName,result:0})
      })
    })
    req.pipe(busboy)
  })

router.get("/stat",(req,res,next)=>{
  Fs.readdir(path,(err,data)=>{
    if (!err) {
      const fileNames=data
      const fileSizes=fileNames.map((fileName)=>{
        return Fs.statSync(Path.join(path,fileName)).size
      })
      res.json({
        result:0,
        kazu:fileNames.length,
        saizu:(fileSizes.reduce((q,p)=>q+p,0) / 1024**2),
        naiyou:fileNames.filter((fileName)=>{
          if (isNumeric(
            fileName.substring(0,21).replace("_",""))
          ) {return false} else {return true}
        })
      })
    }
    else {
      res.json({result: 1})
    }
  })
})

router.get("/mono/:mono/itu/:itu",(req,res,next)=>{
  const url={...req.params}
  const filename=Path.join(path,url.mono)

  claim(`req.filename: ${filename}`)

  let err=new Error()
  err.spec={
    private:url.mono.length>18,
    keys:Object.keys(url)?Object.keys(url).length<2:true,
    mono:url.mono?url.mono.length<3:true,
    itu_l:url.itu?url.itu.toString().length<12:true,
    itu_h:url.itu?!timing(url.itu):true
  }
  
  if (err.spec.private) {
    if (Object.values(err.spec).some((v)=>v)) {
      err.message=Object.keys(err.spec).filter((spec)=>
        {if (err.spec[spec]) return true}).join(", ")
      next(err)
    }
  }
  else {
    Fs.access(filename,(err)=>{
      if (!err) {res.download(filename)}
    })
  }
})

export default router
