const Express=require("express")
const Etc=require("../etc")

const router=Express.Router()

const session={}
const blockWords=[
	"php","cgi","wget","dns","chmod","./"
]

router.all("*",(req,res,next)=>{
		const ip=req.socket.remoteAddress
		
		session.datetime=new Date().toISOString()
		session.ip=ip.slice(ip.indexOf(":",2)+1)
		session.ua=req.get("User-Agent")
		session.method=req.method
		session.url=req.originalUrl
		session.result=0
		
		if (blockWords.some(word=>(session.url.toLowerCase()).includes(word))) {
			session.result=1
		}
		
		console.log(session)
		Etc.nikkiKaki([session])

		if (session.result===1) return res.end()
		
		return next()
	})

module.exports=router
