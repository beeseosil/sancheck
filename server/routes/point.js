const Express=require("express")
const Path=require("path")
const Fs=require("fs")
const Upload=require("express-fileupload")
const Url=require("url")
const Etc=require("../etc")

const router=Express.Router()

router.use(Upload())

router.get("/",(req,res,next)=>{
	res.sendFile(Path.join(__dirname,"..","point.html"))
})

router.get("/stats",(req,res,next)=>{
	Fs.readdir(Path.join(__dirname,"..","public"),(err,data)=>{
		if (!err) {
			const fileNames=data
			res.json({
				"result":0,
				"kazu":fileNames.length,
				"naiyou":fileNames.filter((fileName)=>{
					if (fileName.length>20) {
						~(Etc.isNumeric(fileName.substring(0,12)))
					} else {
						return true
					}
				})
			})
		} else {
			next(err)
		}
	})
})

router.get("*",(req,res,next)=>{
	const path=Path.join(__dirname,"..","public",Url.parse(req.url).path)
	
	Fs.access(path,(err)=>{
		if (!err) {
			if (Fs.lstatSync(path).isFile()) {
				res.download(path)
			}
		} else {
			next(err)
		}
	})
})

router.post("/something",(req,res,next)=>{
	let file
	let fileName
	let filePath
	
	if (!req.files || Object.keys(req.files).length===0) {
		next()
	}
	
	file=req.files.file
	fileName=Etc.naming()+"_"+file.name
	filePath=Path.join(__dirname,"..","public",fileName)
	
	file.mv(filePath,(err)=>{
		if (!err) {
			res.json({
				"result":0,
				"fileName":fileName,
				"fileSize":file.size
			})
		} else {
			next(err)
		}
	})
})

module.exports=router