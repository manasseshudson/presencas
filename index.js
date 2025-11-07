
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


app.get('/alunos/:id_materia',async (req,res)=>{
	const { id_materia } = req.params;
	let Ausente = 0;
	
	const data = dayjs(); // Data e hora atuais
    const dataFormatada = data.format('YYYY-MM-DD');
	const dataF = data.format('DD/MM/YYYY');
	
	
	const qtde_presenca = await knex('tb_presenca_aula_aluno_presencial').where({data: dataF})
	.andWhere('tb_presenca_aula_aluno_presencial.id_materia','=', id_materia)
	.select();
	
	/*knex('tb_materia').where({id_materia}).select().then(result=>{
		knex('tb_aluno')
		.leftJoin('tb_presenca_aula_aluno_presencial','tb_presenca_aula_aluno_presencial.id_aluno','tb_aluno.id_aluno')
		.where({id_modulo: result[0].id_modulo })
		//.andWhere('tb_presenca_aula_aluno_presencial.id_materia','<>', id_materia)		
		//.andWhere('tb_presenca_aula_aluno_presencial.id_materia',null)
		.debug(true)		
		.select('tb_aluno.id_aluno','tb_aluno.nome').then( alunos => {
			//console.log(alunos)
			res.render('alunos', {
				alunos,
				Presente: qtde_presenca.length,
				Ausente,
				id_materia				
			})
		})
	})*/
	knex('tb_materia').where({ id_materia }).select().then(result => {
		knex('tb_aluno').whereNotIn('id_aluno', function() {
			this.select('id_aluno').from('tb_presenca_aula_aluno_presencial').where('id_materia', id_materia); // 👈 apenas dessa matéria
		})
      .then(alunos => {
			console.log(alunos);
			res.render('alunos', {
				alunos,
				Presente: qtde_presenca.length,
				Ausente,
				id_materia
			});
      })
      .catch(err => console.error(err));
      
  })
  .catch(err => console.error(err));

})



app.post('/marcarPresenca',async (req,res)=>{
	const {id_aluno, id_materia,data, hora } = req.body;
	
	try{
	
		const presenca = await knex('tb_presenca_aula_aluno_presencial')
		.insert({
			id_aluno,
			id_materia,
			id_aula: 0,
			data,
			hora		
		});
		res.status(200).send({mensagem : "Presença marcada com sucesso."});
		
	}catch(error){
		console.log(error)
		
	}
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

