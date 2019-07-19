import { Metric, MetricsHandler} from './metrics'
import { UserHandler, User } from './user'
import express = require('express')
import bodyparser = require('body-parser')
import mongodb = require('mongodb')
import session = require('express-session')
import ConnectMongo = require('connect-mongo')

const app= express()
var db: any
var dbUser: any
const MongoStore = ConnectMongo(session)
const MongoClient = mongodb.MongoClient // Create a new MongoClient
const port: string = process.env.PORT || '8025'

//Session
app.use(session({
  secret: 'user session',
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({ url: 'mongodb://localhost/mydb' })
}))

app.set('views', __dirname + "/../views")
app.set('view engine', 'ejs');


//Mongodb
MongoClient.connect("mongodb://localhost:27017", { useNewUrlParser: true }, (err: any, client: any) => {
  if(err) throw err
  db = client.db('mydb')
  dbUser = new UserHandler(db)


//Server
  app.listen(port, (err: Error) => {
    if (err) {
      throw err
    }
    console.log(`server is listening on port ${port}`)
  })
});

//Body parser
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended: true}))


//Metrics
app.post('/metrics', (req: any, res: any) => {
  if(req.body.value){
    const metric = new Metric(new Date().getTime().toString(), parseInt(req.body.value));
    console.log('Posted')
    new MetricsHandler(db).save(metric, req.session.user.username, (err: any, result: any) => {
      if (err)
        return res.status(500).json({error: err, result: result});
      res.status(201).json({error: err, result: true})
    })
  }else{
    return res.status(400).json({error: 'Wrong request parameter',});
  }
})

app.delete('/metrics', (req: any, res: any) => {
  if(req.body.value){
    console.log('Removed')
    new MetricsHandler(db).remove({value: req.body.value}, (err: any, result: any) => {
      if (err)
        return res.status(500).json({error: err, result: result});
      res.status(201).json({error: err, result: true})
    })
  }else{
    return res.status(400).json({error: 'Wrong request parameter',});
  }
})

app.get('/metrics', (req: any, res: any) =>{
    new MetricsHandler(db).getA(req.session.user.username, (err: any, result: any) => {
      if (err)
        return res.status(500).json({error: err, result: result});
        console.log(result)
      res.status(201).json({error: err, result: result})
    })
})


app.post('/delete', (req: any, res: any) => {
    var username = req.session.user.username
    new MetricsHandler(db).remove(username, (err: any, result: any) => {
      if (err)
        console.log("Hello")
    })
    console.log("i got here")
    new UserHandler(db).remove(username, (err: any, result: any) => {
      if (err)
        return res.status(500).json({error: err, result: result});
      res.status(201).json({error: err, result: true})
    })
  if (req.session.loggedIn) {
    delete req.session.loggedIn
    delete req.session.user
  }
  res.redirect('/login')
})




const authRouter = express.Router()
//Pages
authRouter.get('/login', function (req: any, res: any) {
  res.render('login')
})

authRouter.get('/signup', function (req: any, res: any) {
  res.render('signup')
})
authRouter.get('/dashboard', function (req: any, res: any) {
  console.log(req.session)
  res.render('dashboard')
})

authRouter.get('/', function (req: any, res: any) {
  if (req.session.loggedIn) {
    delete req.session.loggedIn
    delete req.session.user
  }
  res.render('index')
})



//Action in pages
//Login
authRouter.post('/login', function (req: any, res: any, next: any) {
  dbUser.get(req.body.username, function (err: Error | null, result: User | null) {
    if (err) next(err)
    if (result === null|| !(result.validatePassword(req.body.password))) {
      res.status(409).write("<script language='javascript'>window.alert('Wrong user or password');window.location='login';</script>");
    } else {
      req.session.loggedIn = true
      req.session.user = result

        res.redirect('/dashboard')

    }
  })
})
app.use(authRouter)

const userRouter = express.Router()

//Signin
authRouter.post('/signup', function (req: any, res: any, next: any) {
  dbUser.get(req.body.username, function (err: Error | null, result: User | null) {
    if (err) next(err)
    if(result){
      res.status(409).write("<script language='javascript'>window.alert('User already exists, try login');window.location='login';</script>");
    }
    else{
      if (!(req.body.password2 === req.body.password)) {
        res.write("<script language='javascript'>window.alert('Passwords don't match, try again');window.location='sigup';</script>");

      }
      else {
        dbUser.save(req.body, function (err: Error | null) {
        if (err) next(err)
        //else res.status(201).send("user persisted")
        else res.redirect('/dashboard')
        })
      }
    }
  })
})

userRouter.get('/:username', (req: any, res: any, next: any) => {
  dbUser.get(req.params.username, function (err: Error | null, result: User | null) {
    if (err || result === undefined) {
      res.status(404).send("user not found")
    } else res.status(200).json(result)
  })
})

app.use(userRouter)


userRouter.get('/:username', (req: any, res: any, next: any) => {
  dbUser.get(req.params.username, function (err: Error | null, result: User | null) {
    if (err || result === undefined) {
      res.status(404).send("user not found")
    } else res.status(200).json(result)
  })
})

app.use(userRouter)

const authCheck = function (req: any, res: any, next: any) {
  if (req.session.loggedIn) {
    next()
  } else res.redirect('/login')
}

app.get('/', authCheck, (req: any, res: any) => {
  res.render('index.ejs', {username: req.session.user.username})
})
