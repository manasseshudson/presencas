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
const title = ''
const title_adm = ""

const adm = require('./adm');

app.use('/', adm);

app.get('/', (req,res)=>{ 
	res.render('login')
})

app.get('/login', (req,res)=>{ 
	res.render('loginv2')
})

app.get('/painel', (req,res)=>{ 
	res.render('painel')
})


app.get('/notas/:id_professor/:id_materia/:id_modulo', async (req,res)=>{ 
	const { id_professor, id_materia, id_modulo } = req.params;
	
	console.log(id_professor + '-'+ id_materia + '-' + id_modulo);
	
	let Ausente = 0;
	
	const data = dayjs(); // Data e hora atuais
    const dataFormatada = data.format('YYYY-MM-DD');
	const dataF = data.format('DD/MM/YYYY');
	
	
	const qtde_presenca = await knex('tb_presenca_aula_aluno_presencial').where({data: dataF})
	.andWhere('tb_presenca_aula_aluno_presencial.id_materia','=', id_materia)
	.select();
	
	const descricaoMateria = await knex('tb_materia').where({ id_materia }).select();
	const professor = await knex('tb_professor').where({id_professor}).select('nome').first();
	
	knex('tb_materia').where({ id_materia }).select().then(result => {
		knex('tb_aluno').where({id_nucleo:6}).andWhere({id_modulo}).andWhere({status:0}).whereNotIn('id_aluno', function() {
			this.select('id_aluno').from('tb_presenca_aula_aluno_presencial').where('id_materia', id_materia).andWhere({data: dataF}); // 👈 apenas dessa matéria
		})
		.debug(true)
      .then(alunos => {
			res.render('notas', {
				id_professor,
				professor: professor.nome,
				alunos,
				Presente: qtde_presenca.length,
				Ausente,
				id_materia,
				materia: descricaoMateria[0].descricao,
				modulo: id_modulo
			});
      })
      .catch(err => console.error(err));
      
  })
  .catch(err => console.error(err));

	
})

app.get('/aluno_nota/:id_aluno/:id_professor/:id_materia/:id_modulo',async (req,res)=>{
	const { id_aluno, id_professor, id_materia, id_modulo } = req.params;
	
	const data = dayjs(); // Data e hora atuais
    const dataFormatada = data.format('YYYY-MM-DD');
	const dataF = data.format('DD/MM/YYYY');
	const descricaoMateria = await knex('tb_materia').where({ id_materia }).select();
	const professor = await knex('tb_professor').where({id_professor}).select('nome').first();
	const notasAlunos = await knex('tb_notas_alunos')
						.where({id_aluno})
						.andWhere({id_materia})
						.innerJoin('tb_professor','tb_professor.id_professor','tb_notas_alunos.id_professor')
						.select();
	
	knex('tb_aluno').where({id_nucleo:6}).andWhere({id_modulo}).andWhere({status:0}).andWhere({id_aluno}).select()
	//.debug(true)
	.then(alunos => {
			res.render('aluno_nota', {
				id_professor,
				professor: professor.nome,
				alunos,
				nomeAluno:alunos[0].nome,
				id_aluno,				
				id_materia,
				materia: descricaoMateria[0].descricao,
				modulo: id_modulo,
				notasAlunos
			});
      })
      
})

app.get('/remNotaAluno/:id_aluno/:id_professor/:id_materia/:id_modulo/:id_notas_alunos', (req,res)=>{
	const { id_aluno, id_professor, id_materia, id_modulo, id_notas_alunos } = req.params;
	
	console.log('id_aluno'+id_aluno)
	console.log('id_professor'+id_professor)
	console.log('id_materia'+ id_materia)
	console.log('id_modulo'+ id_modulo)
	
	try{
		knex('tb_notas_alunos').where({id_notas_alunos}).del()
		.then(result=>{console.log(result)});
		res.redirect('/aluno_nota/'+id_aluno+'/'+id_professor+'/'+id_materia+'/'+id_modulo)
	}catch(error){		
		console.log(error)
	}
})

app.post('/enviarNota', (req,res)=>{
	const {id_professor,id_aluno,id_materia,id_modulo,data,hora,tipo,nota} = req.body;
	//console.log(id_aluno)
	
	try{
		knex('tb_notas_alunos')
		.insert({
			id_professor,
			id_aluno,
			id_materia,
			id_modulo,
			data,
			hora,
			tipo,
			nota
			
		}).then(result=>{
			console.log(result)
			//res.redirect('/aluno_nota/'+id_aluno+'/'+id_professor+'/'+id_materia+'/'+id_modulo)
			res.status(200).send({mensagem : "Nota enviada com Sucesso"});
		})
		
		
	}catch(error){
		console.log(error)
		
	}
	
			
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

app.get('/professores',(req,res)=>{
	
	knex('tb_professor').select().then(professores=>{
		res.render('professores',{
			professores
		})
	})
})

app.get('/modulo/:id_professor',async (req,res)=>{
	const {id_professor} = req.params;
	
	//res.render('modulo')
	const data = dayjs(); // Data e hora atuais
    const dataFormatada = data.format('YYYY-MM-DD');
	const dataF = data.format('DD/MM/YYYY');
	
	const qtdepresencas1Ano = await knex('tb_presenca_aula_aluno_presencial')
								.count('id_presenca_aula_aluno_presencial as qtde')
								.where({id_modulo:1})
								.andWhere({data: dataF})
								.select();
								
	const qtdepresencas2Ano = await knex('tb_presenca_aula_aluno_presencial')
								.count('id_presenca_aula_aluno_presencial as qtde')
								.where({id_modulo:2})
								.andWhere({data: dataF})
								.select();
								
	const qtdepresencasMedio = await knex('tb_presenca_aula_aluno_presencial')
								.count('id_presenca_aula_aluno_presencial as qtde')
								.where({id_modulo:3})
								.andWhere({data: dataF})
								.select();
								
	//console.log(qtdepresencasMedio[0].qtde)
	
	let qtdeTotalPresentesDia = qtdepresencas1Ano[0].qtde + qtdepresencas2Ano[0].qtde + qtdepresencasMedio[0].qtde;
	
	
	const professor = await knex('tb_professor').where({id_professor}).select('nome').first();
	
	
	
	
	
	
	res.render('modulo',{
		id_professor,
		professor: professor.nome,
		qtdepresencas1Ano:qtdepresencas1Ano[0].qtde,
		qtdepresencas2Ano:qtdepresencas2Ano[0].qtde,
		qtdepresencasMedio:qtdepresencasMedio[0].qtde,
		qtdeTotalPresentesDia
	})
})

app.get('/materias/:id_professor/:id_modulo',async (req,res)=>{
	const { id_professor, id_modulo } = req.params;
	
	let titulo ="";
	if (id_modulo=="1"){
		titulo = "Matérias do 1º Ano "
	}
	if (id_modulo=="2"){
		titulo = "Matérias do 2º Ano "
	}
	if (id_modulo=="3"){
		titulo = "Matérias do Ensino Médio "
	}
	
	const professor = await knex('tb_professor').where({id_professor}).select('nome').first();
	
	knex('tb_materia').where({id_modulo}).select().then(materias=>{
		console.log(id_modulo)
		res.render('materias', {
			id_professor,
			professor: professor.nome,
			id_modulo,
			materias,
			titulo
		})
	})
})

app.get('/alunos/:id_professor/:id_materia/:id_modulo',async (req,res)=>{
	const { id_professor, id_materia, id_modulo } = req.params;
	let Ausente = 0;
	
	const data = dayjs(); // Data e hora atuais
    const dataFormatada = data.format('YYYY-MM-DD');
	const dataF = data.format('DD/MM/YYYY');
	
	
	const qtde_presenca = await knex('tb_presenca_aula_aluno_presencial').where({data: dataF})
	.andWhere('tb_presenca_aula_aluno_presencial.id_materia','=', id_materia)
	.select();
	
	const descricaoMateria = await knex('tb_materia').where({ id_materia }).select();
	const professor = await knex('tb_professor').where({id_professor}).select('nome').first();
	
	knex('tb_materia').where({ id_materia }).select().then(result => {
		knex('tb_aluno').where({id_nucleo:6}).andWhere({id_modulo}).andWhere({status:0}).whereNotIn('id_aluno', function() {
			this.select('id_aluno').from('tb_presenca_aula_aluno_presencial').where('id_materia', id_materia).andWhere({data: dataF}); // 👈 apenas dessa matéria
		})
		.debug(true)
      .then(alunos => {
			//console.log('materia'+id_materia)
			//console.log('modulo'+id_modulo)
			//console.log(alunos)
			res.render('alunos', {
				id_professor,
				professor: professor.nome,
				alunos,
				Presente: qtde_presenca.length,
				Ausente,
				id_materia,
				materia: descricaoMateria[0].descricao,
				modulo: id_modulo
			});
      })
      .catch(err => console.error(err));
      
  })
  .catch(err => console.error(err));

})


app.get('/alunos_presentes/:id_professor/:id_materia/:id_modulo',async (req,res)=>{
	const { id_professor, id_materia, id_modulo } = req.params;
	let Ausente = 0;
	
	const data = dayjs(); // Data e hora atuais
    const dataFormatada = data.format('YYYY-MM-DD');
	const dataF = data.format('DD/MM/YYYY');
	
	
	const qtde_presenca = await knex('tb_aluno').whereIn('id_aluno', function() {
			this.select('id_aluno').from('tb_presenca_aula_aluno_presencial').where('id_materia', id_materia); // 👈 apenas dessa matéria
	});
	
	
	const professor = await knex('tb_professor').where({id_professor}).select('nome').first();
	
	const descricaoMateria = await knex('tb_materia').where({ id_materia }).select();
	console.log(descricaoMateria[0].descricao)
	
	
	knex('tb_materia').where({ id_materia }).select().then(result => {
		//knex('tb_aluno').whereNotIn('id_aluno', function() {
		knex('tb_aluno').where({id_nucleo:6}).whereIn('id_aluno', function() {
			this.select('id_aluno').from('tb_presenca_aula_aluno_presencial').where('id_materia', id_materia); // 👈 apenas dessa matéria
		})
      .then(alunos => {
		  console.log('SQL:', alunos.sql);
			res.render('alunos_presentes', {
				alunos,
				Presente: qtde_presenca.length,
				Ausente,
				id_materia,
				materia: descricaoMateria[0].descricao,
				modulo: id_modulo,
				id_professor,
				professor: professor.nome
			});
      })
      .catch(err => console.error(err));
      
  })
  .catch(err => console.error(err));

})


app.get('/remPresenca/:id_professor/:id_aluno/:id_materia/:id_modulo', async(req,res)=>{
	const { id_professor, id_aluno, id_materia, id_modulo} = req.params;
	let Ausente = 0;
	console.log(id_aluno + '-'+ id_materia+ '-'+ id_modulo)
	
	const data = dayjs(); // Data e hora atuais
    const dataFormatada = data.format('YYYY-MM-DD');
	const dataF = data.format('DD/MM/YYYY');
	
	
	const qtde_presenca = await knex('tb_aluno').whereIn('id_aluno', function() {
			this.select('id_aluno').from('tb_presenca_aula_aluno_presencial').where('id_materia', id_materia); // 👈 apenas dessa matéria
	});
	
	
	const descricaoMateria = await knex('tb_materia').where({ id_materia }).select();
	
	
	try{
		knex('tb_presenca_aula_aluno_presencial').where({id_aluno}).andWhere({id_materia}).andWhere({id_modulo}).del().then(result=>{
			knex('tb_materia').where({ id_materia }).select().then(result => {
		//knex('tb_aluno').whereNotIn('id_aluno', function() {
		knex('tb_aluno').whereIn('id_aluno', function() {
			this.select('id_aluno').from('tb_presenca_aula_aluno_presencial').where('id_materia', id_materia); // 👈 apenas dessa matéria
		})
		  .then(alunos => {
				
				res.redirect('/alunos_presentes/'+id_professor+'/'+id_materia+'/'+id_modulo)
				
				/*res.render('alunos_presentes', {
					alunos,
					Presente: qtde_presenca.length,
					Ausente,
					id_materia,
					materia: descricaoMateria[0].descricao,
					modulo: id_modulo,
					id_professor,
					professor:""
				});*/
		  })
		  .catch(err => console.error(err));
		  
	  })		
		});
	}catch(error){
		console.log(error)
		
	}
	
})



app.post('/marcarPresenca',async (req,res)=>{
	const {id_professor,id_aluno, id_materia, id_modulo, data, hora } = req.body;
	
	try{
	
		const presenca = await knex('tb_presenca_aula_aluno_presencial')
		.insert({
			id_professor,
			id_aluno,
			id_materia,
			id_modulo,
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