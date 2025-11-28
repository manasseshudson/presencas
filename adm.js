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
const router = express.Router();

///***********************************************************************************************
router.get('/adm',async(req,res)=>{
	
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
								
								
								
	const qtdeTotalAlunos = await knex('tb_aluno')
								.count('id_aluno as qtde')
								.where({id_nucleo:6})
								.select();
	
	
	const alunosPresentes = await knex('tb_presenca_aula_aluno_presencial')
								.innerJoin('tb_aluno','tb_aluno.id_aluno','tb_presenca_aula_aluno_presencial.id_aluno')
								.innerJoin('tb_materia','tb_materia.id_materia','tb_presenca_aula_aluno_presencial.id_materia')
								.innerJoin('tb_modulo','tb_modulo.id_modulo','tb_presenca_aula_aluno_presencial.id_modulo')
								.innerJoin('tb_professor','tb_professor.id_professor','tb_presenca_aula_aluno_presencial.id_professor')
								.where({data: dataF})
								.select('tb_aluno.id_aluno',
										'tb_aluno.nome',
										'tb_materia.id_materia',
										'tb_materia.descricao as materia',
										'tb_modulo.id_modulo',
										'tb_modulo.descricao as modulo',
										'tb_professor.id_professor',
										'tb_professor.nome as professor');
	
	
	let qtdeTotalPresentesDia = qtdepresencas1Ano[0].qtde + qtdepresencas2Ano[0].qtde + qtdepresencasMedio[0].qtde;
	
	
	let qtdeAlunosFaltantes = qtdeTotalAlunos[0].qtde - qtdeTotalPresentesDia;
	
	
	res.render('adm/principal',{
		qtdepresencas1Ano:qtdepresencas1Ano[0].qtde,
		qtdepresencas2Ano:qtdepresencas2Ano[0].qtde,
		qtdepresencasMedio:qtdepresencasMedio[0].qtde,
		qtdeTotalPresentesDia,
		qtdeTotalAlunos:  qtdeTotalAlunos[0].qtde,
		qtdeAlunosFaltantes,
		alunosPresentes
	})
})
router.get('/adm/materias/:id_modulo', async(req,res)=>{
	const { id_modulo } = req.params;
	
	let titulo ="";
	if (id_modulo=="1"){
		titulo = "do 1º Ano "
	}
	if (id_modulo=="2"){
		titulo = "do 2º Ano "
	}
	if (id_modulo=="3"){
		titulo = "do Ensino Médio "
	}
	
	knex('tb_materia').where({id_modulo}).select().then(materias=>{
		res.render('adm/materias', {
			id_modulo,
			materias,
			titulo
		})
	})
})


router.get('/adm/alunos/:id_materia/:id_modulo',async (req,res)=>{
	const { id_materia, id_modulo } = req.params;
	let Ausente = 0;
	
	const data = dayjs(); // Data e hora atuais
    const dataFormatada = data.format('YYYY-MM-DD');
	const dataF = data.format('DD/MM/YYYY');
	
	
	const qtde_presenca = await knex('tb_aluno').whereIn('id_aluno', function() {
			this.select('id_aluno').from('tb_presenca_aula_aluno_presencial').where('id_materia', id_materia); // 👈 apenas dessa matéria
	});
	
	
	const descricaoMateria = await knex('tb_materia').where({ id_materia }).select();
	console.log(descricaoMateria[0].descricao)
	
	
	knex('tb_materia').where({ id_materia }).select().then(result => {
		//knex('tb_aluno').whereNotIn('id_aluno', function() {
		knex('tb_aluno').where({id_nucleo:6}).whereIn('id_aluno', function() {
			this.select('id_aluno').from('tb_presenca_aula_aluno_presencial').where('id_materia', id_materia); // 👈 apenas dessa matéria
		})
      .then(alunos => {
		  console.log('SQL:', alunos.sql);
			res.render('adm/alunos', {
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


router.get('/adm/remPresenca/:id_aluno/:id_materia/:id_modulo', async(req,res)=>{
	const { id_aluno, id_materia, id_modulo} = req.params;
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
				res.render('adm/alunos', {
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
		});
	}catch(error){
		console.log(error)
		
	}
	
})


module.exports = router;