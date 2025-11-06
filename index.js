
const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const { Knex } = require('knex');
const knex = require('./database/database');
const base64 = require('base-64');
const uniqid = require('uniqid'); 
const uid2 = require('uid2');
const path = require('path');
const cors = require('cors');
const dayjs = require('dayjs');
console.log(dayjs().format())

require('dotenv').config();
app.use(cors());

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));


app.use((req, res, next) => {
	//Qual site tem permissão de realizar a conexão, no exemplo abaixo está o "*" indicando que qualquer site pode fazer a conexão
    res.header("Access-Control-Allow-Origin", "*");
	//Quais são os métodos que a conexão pode realizar na API
    res.header("Access-Control-Allow-Methods", 'GET,PUT,POST,DELETE');
    app.use(cors());
    next();
});
const title = 'IBADEJUF EAD'
const title_adm = ""

const login = require('./login');
const adm = require('./adm');

app.get('/', (req,res)=>{ 
	res.render('login')
})
app.post('/login',(req,res)=>{
	const { email, senha } = req.body;
	console.log(email);
	console.log(senha)
	
	if(email=="ibadejuf2025@gmail.com" && senha =="123456"){
		res.status(200).send({mensagem : "Bem Vindo Administrador"});
	}else{
		res.status(200).send({mensagem : "Login Efetuado com sucesso."});
	}
})


app.get('/adm',(req,res)=>{
	
	res.render('adm')
	
	
})


app.get('/materias',(req,res)=>{
	let Ausente = 0;
	let Presente ="10";
	
	const data = dayjs(); // Data e hora atuais
    const dataFormatada = data.format('YYYY-MM-DD');
	const dataF = data.format('DD/MM/YYYY');
	
	//knex('tb_materia').where({id_modulo: 1}).select().then(materias=>{
	knex('tb_materia').select().then(materias=>{
		console.log(materias)
		res.render('materias', {
			materias,
			titulo: ""
		})
	})
})


app.get('/alunos/:id_materia',(req,res)=>{
	const { id_materia } = req.params;
	
	
	console.log('id da materia :' +id_materia)
	
	let Ausente = 0;
	let Presente ="10";
	
	const data = dayjs(); // Data e hora atuais
    const dataFormatada = data.format('YYYY-MM-DD');
	const dataF = data.format('DD/MM/YYYY');
	
	//console.log(dataF)
	//console.log(dataFormatada)
	
	knex('tb_materia').where({id_materia}).select().then(result=>{
		console.log(result)
		console.log(result[0].id_modulo)
		
		knex('tb_aluno').where({id_modulo: result[0].id_modulo }).select().then( alunos => {
			res.render('alunos', {
				alunos,
				Presente,
				Ausente	
			})
		})
	})


})



app.post('/marcarPresenca',(req,res)=>{
	const {id_aluno, data, hora } = req.body;
	
	//const data = dayjs(); // Data e hora atuais
    //const dataFormatada = data.format('YYYY-MM-DD');

    
	//const data = dayjs(); // Data e hora atuais
    //const dataFormatada = data.format('YYYY-MM-DD');
	//const dataF = data.format('DD/MM/YYYY');
	console.log('Data :'+data); // Exemplo: 2024-05-16	
	console.log('Hora: '+hora)
	console.log('id Aluno :'+id_aluno)
	
	
	
	
	
	
})


app.get('/loginv2', (req,res)=>{ 
    //res.redirect('/login')
	res.render('loginv2',{
		title,
		abrir_aviso: false,
		mensagem_modal: 'Usuário ou Senha Inválidos' ,
		tempo_modal :6000,
		title
	})
})


app.get('/uid', (req,res)=>{ 
    res.send(uid2(10))
    //res.redirect('/login')
})

app.get('/base64decode/:dados' , (req , res) => { 
    const { dados } = req.params;
    res.send(base64.decode(dados))
}); 
app.listen(3009,()=>{
	console.log('Api Rodando porta  3009')
})

