const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const { Knex } = require('knex');
const knex = require('./database/database');
const base64 = require('base-64');
const uniqid = require('uniqid'); 
const uid2 = require('uid2');
//const cookieParser = require('cookie-parser');
//router.use(cookieParser());
const router = express.Router();

const dayjs = require('dayjs');

console.log(dayjs().format())

const title = 'IBADEJUF EAD'
const title_adm = ""

router.get('/adm/remProvas/:id_provas/:uid_usuario', (req,res)=>{ 
    const { id_provas, uid_usuario } = req.params;

    knex('tb_provas').where({id_provas: id_provas}).delete().then(result_usuario=>{
        res.redirect('/adm/addProvas/'+uid_usuario)		
    })
})


router.get('/adm/lancarNotas/:uid_usuario', (req,res)=>{ 
        const { uid_usuario } = req.params;

    knex('tb_usuario').where({uid_usuario: uid_usuario}).select().then(result=>{
		
        knex('tb_aluno').where({id_aluno: result[0].id_aluno}).select().then(dados=>{
            knex('tb_aluno')
            .where('tb_aluno.nome','<>','Administrador')
            //.andWhere('tb_usuario.id_nivel','=','3')
            .leftJoin('tb_modulo','tb_modulo.id_modulo','tb_aluno.id_modulo')
            .leftJoin('tb_nucleo','tb_nucleo.id_nucleo','tb_aluno.id_nucleo')
            .leftJoin('tb_modalidade','tb_modalidade.id_modalidade','tb_aluno.id_modalidade')
            .innerJoin('tb_usuario','tb_usuario.id_aluno','tb_aluno.id_aluno')
            .select('tb_aluno.id_aluno','tb_aluno.cpf','tb_aluno.nome','tb_aluno.email',
                        'tb_modulo.descricao as modulo','tb_modalidade.descricao as modalidade',
                        'tb_aluno.endereco_telefone','tb_aluno.status','tb_nucleo.descricao as nucleo','tb_aluno.data_nascimento'
                        
            ).then(result=>{

                console.log(result)
				knex('tb_nucleo').select().then(nucleos=>{
                    res.render('adm/lancarNotas',{
                        title,
                        logo: 'IBADEJUF',
                        Alunos: result,
                        user: dados[0].nome,
                        uid_usuario,
                        nucleos,
						descricao_nucleo: "",
                        titulo_pagina: "",
                        botoes_aniversariantes:0
                    })
                })
            })
        })        
    })       

    
        
    
})

router.get('/adm/addProvas/:uid_usuario', (req,res)=>{ 
    const { uid_usuario } = req.params;

    knex('tb_usuario').where({uid_usuario: uid_usuario}).select().then(result_usuario=>{
        knex("tb_materia").select().then((materia) => {				
			knex('tb_nucleo').select().then(nucleos=>{
				knex('tb_provas')
				.innerJoin('tb_materia','tb_materia.id_materia','tb_provas.id_materia')
				.select('tb_provas.descricao','tb_provas.link','tb_materia.descricao as materia','tb_provas.id_provas').then(provas=>{
					res.render('adm/addProvas',{
						title,
						materia,
						user: result_usuario[0].descricao,
						uid_usuario,
						nucleos,
						provas
					})
				})
			})
        })
    })
})

router.post('/adm/addProvas', (req,res)=>{ 
    const { descricao, id_materia, link, uid_usuario } = req.body;

	

	
	knex('tb_provas').insert({
		descricao : descricao,
		link: link,
		id_materia:id_materia
	}).then(result=>{
		res.redirect('/adm/addProvas/'+uid_usuario)		
	})
	
    
})





router.get('/adm/addProvas/:uid_usuario', (req,res)=>{ 
    const { id_aluno, uid_usuario } = req.params;

    knex('tb_usuario').where({uid_usuario: uid_usuario}).select().then(result_usuario=>{
        knex('tb_aulas')
        .innerJoin('tb_modulo','tb_modulo.id_modulo','tb_aulas.id_modulo')
		.innerJoin('tb_materia','tb_materia.id_materia','tb_aulas.id_materia')
        .select('tb_materia.id_materia ','tb_materia.descricao as materia ','tb_aulas.ordem','tb_aulas.descricao','tb_aulas.link','tb_modulo.descricao as modulo','tb_aulas.id_aulas','tb_aulas.ordem')
        .orderBy('tb_aulas.ordem')
        .then(result=>{
            knex("tb_materia").select().then((materia) => {
				knex("tb_modulo").select().then((modulo) => {
                    knex('tb_nucleo').select().then(nucleos=>{
                        res.render('adm/addProvas',{
                            title,
                            materia,
                            modulo,
                            Aulas: result,
                            user: result_usuario[0].descricao,
                            uid_usuario,
                            nucleos
                        })
                    })
				})
            })
        })
    })
})



router.post('/adm/reset_senha_aluno',(req,res)=>{
	const { uid_usuario, id_aluno } = req.body;
	
	let senha_padrao ="MTIz";
	
	knex("tb_usuario").where({ id_aluno: id_aluno })
	.update({
		senha: senha_padrao
	}).then(result=>{
		console.log('senha alterada')
		res.send("senha alterada")
		//res.redirect('/adm/alunos/'+uid_usuario)    
	})
})


router.get('/adm/alunos_nucleo/:uid_usuario/:id_nucleo',(req,res)=>{
    const { uid_usuario, id_nucleo } = req.params;

    knex('tb_usuario').where({uid_usuario: uid_usuario}).select().then(result=>{
        knex('tb_aluno').where({id_aluno: result[0].id_aluno}).select().then(dados=>{
            knex('tb_aluno')
            .where('tb_aluno.id_aluno','>', '1' )
            .andWhere('tb_usuario.id_nivel','<>','1')
            .andWhere('tb_nucleo.id_nucleo',id_nucleo)
            .leftJoin('tb_modulo','tb_modulo.id_modulo','tb_aluno.id_modulo')
            .leftJoin('tb_modalidade','tb_modalidade.id_modalidade','tb_aluno.id_modalidade')
            .leftJoin('tb_nucleo','tb_nucleo.id_nucleo','tb_aluno.id_nucleo')
            .innerJoin('tb_usuario','tb_usuario.id_aluno','tb_aluno.id_aluno')
            .select('tb_aluno.id_aluno','tb_aluno.cpf','tb_aluno.nome','tb_aluno.email',
                        'tb_modulo.descricao as modulo','tb_modalidade.descricao as modalidade',
                        'tb_aluno.endereco_telefone','tb_aluno.status','tb_nucleo.descricao as nucleo','tb_aluno.data_nascimento'
                        
            ).then(result=>{
				knex('tb_nucleo').where({id_nucleo: id_nucleo}).select().then(nucleos_descricao=>{
					console.log(result)
					knex('tb_nucleo').select().then(nucleos=>{
						res.render('adm/alunos',{
							title,
							logo: 'IBADEJUF',
							Alunos: result,
							user: dados[0].nome,
							uid_usuario,
							nucleos,
							descricao_nucleo: nucleos_descricao[0].descricao,
                            titulo_pagina: "",
                            botoes_aniversariantes:0
						})
					})
                })
            })
        })        
    })  

})


router.post('/adm/addNucleo/',(req,res)=>{
    const { nucleo, uid_usuario } = req.body;
    knex('tb_nucleo').insert({
        descricao: nucleo
    }).then(dados_nucleo => {
        res.redirect('/adm/addNucleo/'+uid_usuario);
    })
})

router.get('/adm/addNucleo/:uid_usuario',(req,res)=>{
    const { uid_usuario } = req.params;
    knex('tb_usuario').where({uid_usuario: uid_usuario}).select().then(result=> {
        knex('tb_aluno').where({id_aluno: result[0].id_aluno}).select().then(dados_aluno => {
            knex('tb_nucleo').select().then(dados_nucleo => {
                knex('tb_nucleo').select().then(nucleos=>{
                    res.render('adm/addNucleo', {
                        title,
                        logo: 'IBADEJUF',
                        logo_site: title,
                        user: dados_aluno[0].nome,
                        uid_usuario,
                        Nucleo : dados_nucleo,
                        nucleos
                    })
                })
            })
        })
    })
})

router.get('/adm/rem_nucleo/:id_nucleo/:uid_usuario',(req,res)=>{
    const {id_nucleo, uid_usuario } = req.params;

    knex('tb_usuario').where({uid_usuario: uid_usuario}).select().then(result=> {
        knex('tb_aluno').where({id_aluno: result[0].id_aluno}).select().then(dados_aluno => {
            knex('tb_nucleo').where({id_nucleo: id_nucleo}).del().then(dados_nucleo => {

                knex('tb_nucleo').select().then(dados_nucleo => {
                    knex('tb_nucleo').select().then(nucleos=>{
                        res.render('adm/addNucleo', {
                            title,
                            logo: 'IBADEJUF',
                            logo_site: title,
                            user: dados_aluno[0].nome,
                            uid_usuario,
                            Nucleo: dados_nucleo,
                            nucleos
                        })
                    })
                })
            })
        })
    })
})



router.get('/adm/principal/:uid_usuario', (req,res)=>{
    const { uid_usuario } = req.params;
    const data = dayjs(); // Data e hora atuais
    const dataFormatada = data.format('YYYY-MM-DD');

    console.log(dataFormatada); // Exemplo: 2024-05-16

    knex('tb_usuario').where({uid_usuario: uid_usuario}).select().then(result=>{
        knex('tb_aluno').where({id_aluno: result[0].id_aluno}).select().then(dados_aluno=>{
			knex('tb_aluno')
			.innerJoin('tb_usuario', 'tb_aluno.id_aluno', 'tb_usuario.id_aluno').where({id_nivel: 2})			
			.count('tb_aluno.id_aluno as qtde').select().then(qtdeAlunos=>{
				knex('tb_materia').where({id_modulo: 1}).count('id_materia as qtde').select().then(qtdeMateriasAno1=>{
					knex('tb_materia').where({id_modulo: 2}).count('id_materia as qtde').select().then(qtdeMateriasAno2=>{
						knex('tb_materia').where({id_modulo: 3}).count('id_materia as qtde').select().then(qtdeMateriasAnoMedio=>{
							
							knex('tb_log_acessos')
							.innerJoin('tb_aluno', 'tb_aluno.id_aluno', 'tb_log_acessos.id_aluno')
							.select('tb_aluno.Nome','tb_log_acessos.data','tb_log_acessos.hora').then(logs=>{								
								knex('tb_aulas').where({id_modulo: 1}).count('id_aulas as qtde').select().then(qtdeAulasAno1=>{

                                    knex('tb_nucleo').select().then(nucleos=>{
                                        console.log(nucleos)
                                        res.render('adm/principal',{
                                            logs,
                                            title,
                                            logo: 'IBADEJUF',
                                            logo_site: title,
                                            qtdeAlunos: qtdeAlunos[0].qtde,
                                            qtdeMateriasAno1: qtdeMateriasAno1[0].qtde,
                                            qtdeMateriasAno2: qtdeMateriasAno2[0].qtde,
                                            qtdeMateriasAnoMedio: qtdeMateriasAnoMedio[0].qtde,
                                            user: dados_aluno[0].nome,
                                            uid_usuario,
                                            qtdeAulasAno1: qtdeAulasAno1[0].qtde,
                                            qtdeAulasAno2: 0,
                                            qtdeAulasMedio: 0,
                                            nucleos
                                        })
                                    })
								})
							})
						})
					})
				})
			})
        })
    })
})

/*
router.get('/adm/ContasPagar/:uid_usuario',(req, res)=> {
    const { uid_usuario } = req.params;
    knex('tb_usuario').where({uid_usuario: uid_usuario}).select().then(result=>{
        knex('tb_contas').select().then(contas=>{
			knex('tb_fornecedor').select().then(fornecedor=>{
				knex('tb_contas_pagar').sum('valor_total AS valor_total').where('data_pagamento', '<>', '1902-01-01 00:00:00').select().then(vlr_contas_pagas=>{
					
					knex('tb_contas_pagar').sum('valor_total AS valor_total_a_pagar').where('data_pagamento', '=', '1902-01-01 00:00:00').select().then(vlr_contas_a_pagar=>{
					
						knex('vw_contas_pagar').select().then(contas_a_pagar=>{
							res.render("adm/contasPagar", {
								title,
								logo: 'IBADEJUF',
								title_page: title_adm,
								abrir_aviso: false,
								abrir_aviso_opcao: "danger",
								mensagem_modal: "Aluno já cadastrado",
								user: "",
								uid_usuario,
								fornecedor,
								contas,
								contas_a_pagar,
								vlr_contas_pagas: vlr_contas_pagas[0].valor_total,
								vlr_contas_a_pagar: vlr_contas_a_pagar[0].valor_total_a_pagar
							});        
							
						})
					})
				})	
			})   
		})
	})
    
})


router.post('/adm/ContasPagar',(req,res)=>{
	const { uid_usuario, lancamento, vencimento,id_fornecedor,documento, descricao,
				id_contas, valor, valor_multa, valor_juros, valor_total, data_pagto, observacao, status	
			} = req.body;
	
	//let status=0;
	
	let data_pagto_="";

	let valor_ = "0";
	let valor_juros_ = "0";
	let valor_multa_ = "0";
	
	
	console.log(valor)
	if(valor!=""){
		valor_ = valor;
	}else{
		valor_ ="0"		
	}
	console.log(valor_)
	if(valor_juros!=""){
		valor_juros_ = valor_juros;
	}

	if(valor_multa!=""){
		valor_multa_ = valor_multa;
	}
	
	if(vencimento==""){
		data_venc_= "19020101";
	}else{
		data_venc_ = FormataStringData(vencimento);
	}
	
	if(data_pagto==""){
		data_pagto_= "19020101";
	}else{
		data_pagto_ = FormataStringData(data_pagto);
	}
	knex('tb_contas_pagar').insert({
		descricao: descricao,
		id_fornecedor: id_fornecedor,
		id_conta: id_contas,
		data_documento: FormataStringData(dataDia()),
		data_vencimento: data_venc_,
		data_pagamento: data_pagto_,
		documento: documento,
		valor: valor.replace(',','.'),
		valor_multa: valor_multa_.replace(',','.'),
		valor_juros: valor_juros_.replace(',','.'),
		valor_total : valor_total.replace(',','.'),
		observacao: observacao,
		uid_usuario: uid_usuario,
		status: status
	})	
	//.returning('uid_usuario')	
	.then(result=>{
		
		knex('tb_usuario').where({uid_usuario: uid_usuario}).select().then(result=>{
        knex('tb_contas').select().then(contas=>{
			knex('tb_fornecedor').select().then(fornecedor=>{
				knex('tb_contas_pagar').sum('valor_total AS valor_total').where('data_pagamento', '<>', '1902-01-01 00:00:00').select().then(vlr_contas_pagas=>{
					
					knex('tb_contas_pagar').sum('valor_total AS valor_total_a_pagar').where('data_pagamento', '=', '1902-01-01 00:00:00').select().then(vlr_contas_a_pagar=>{
					
						knex('vw_contas_pagar').select().then(contas_a_pagar=>{
							res.render("adm/contasPagar", {
								title,
								logo: 'IBADEJUF',
								title_page: title_adm,
								abrir_aviso: false,
								abrir_aviso_opcao: "danger",
								mensagem_modal: "Aluno já cadastrado",
								user: "",
								uid_usuario,
								fornecedor,
								contas,
								contas_a_pagar,
								vlr_contas_pagas: vlr_contas_pagas[0].valor_total,
								vlr_contas_a_pagar: vlr_contas_a_pagar[0].valor_total_a_pagar
							});        
							
						})
					})
				})	
			})   
		})
	})
	})
	
})
*/
//ALUNOS
/*
router.get('/adm/alunos_aniversariantes_mes/:uid_usuario',(req,res)=>{
    const { uid_usuario } = req.params;
    console.log('/adm/alunos_aniversariantes_mes/:uid_usuario')
    knex('tb_usuario').where({uid_usuario: uid_usuario}).select().then(result=>{
        knex('tb_aluno').where({id_aluno: result[0].id_aluno}).select().then(dados=>{
            knex('tb_aluno')
            .where('tb_aluno.id_aluno','>', '1' )
            .whereRaw('month(tb_aluno.data_nascimento_banco) = '+retornaNumeroMes())
            .leftJoin('tb_modulo','tb_modulo.id_modulo','tb_aluno.id_modulo')
            .leftJoin('tb_modalidade','tb_modalidade.id_modalidade','tb_aluno.id_modalidade')
            .innerJoin('tb_usuario','tb_usuario.id_aluno','tb_aluno.id_aluno')
            .select('tb_aluno.id_aluno','tb_aluno.cpf','tb_aluno.nome','tb_aluno.email',
                        'tb_modulo.descricao as modulo','tb_modalidade.descricao as modalidade',
                        'tb_aluno.endereco_telefone','tb_aluno.status', 'tb_aluno.data_nascimento'
                        
            ).then(result=>{
				knex('tb_nucleo').select().then(nucleos=>{
                    res.render('adm/alunos',{
                        title,
                        logo: 'IBADEJUF',
                        Alunos: result,
                        user: dados[0].nome,
                        uid_usuario,
                        nucleos,
						descricao_nucleo: "",
                        titulo_pagina: 'Aniversariantes do Mês de ' + retornaNomeMes(),
                        botoes_aniversariantes:1
                    })
                })
            })
        })        
    })
})
*/

router.get('/adm/alunos_aniversariantes_mes/:uid_usuario/:mes',(req,res)=>{
    const { uid_usuario, mes } = req.params;
    console.log(uid_usuario);
    console.log(mes);

    if(mes==0){
        knex('tb_usuario').where({uid_usuario: uid_usuario}).select().then(result=>{
            knex('tb_aluno').where({id_aluno: result[0].id_aluno}).select().then(dados=>{
                knex('tb_aluno')
                .where('tb_aluno.id_aluno','>', '1' )
                .whereRaw('month(tb_aluno.data_nascimento_banco) = '+retornaNumeroMes())
                .leftJoin('tb_modulo','tb_modulo.id_modulo','tb_aluno.id_modulo')
                .leftJoin('tb_modalidade','tb_modalidade.id_modalidade','tb_aluno.id_modalidade')
                .innerJoin('tb_usuario','tb_usuario.id_aluno','tb_aluno.id_aluno')
                .select('tb_aluno.id_aluno','tb_aluno.cpf','tb_aluno.nome','tb_aluno.email',
                            'tb_modulo.descricao as modulo','tb_modalidade.descricao as modalidade',
                            'tb_aluno.endereco_telefone','tb_aluno.status', 'tb_aluno.data_nascimento'
                            
                ).then(result=>{
                    knex('tb_nucleo').select().then(nucleos=>{
                        res.render('adm/alunos',{
                            title,
                            logo: 'IBADEJUF',
                            Alunos: result,
                            user: dados[0].nome,
                            uid_usuario,
                            nucleos,
                            descricao_nucleo: "",
                            titulo_pagina: 'Aniversariantes do Mês de ' + retornaNomeMes(),
                            botoes_aniversariantes:1
                        })
                    })
                })
            })        
        })
    }else{
        knex('tb_usuario').where({uid_usuario: uid_usuario}).select().then(result=>{
            knex('tb_aluno').where({id_aluno: result[0].id_aluno}).select().then(dados=>{
                knex('tb_aluno')
                .where('tb_aluno.id_aluno','>', '1' )
                .whereRaw('month(tb_aluno.data_nascimento_banco) = '+mes)
                .leftJoin('tb_modulo','tb_modulo.id_modulo','tb_aluno.id_modulo')
                .leftJoin('tb_modalidade','tb_modalidade.id_modalidade','tb_aluno.id_modalidade')
                .innerJoin('tb_usuario','tb_usuario.id_aluno','tb_aluno.id_aluno')
                .select('tb_aluno.id_aluno','tb_aluno.cpf','tb_aluno.nome','tb_aluno.email',
                        'tb_modulo.descricao as modulo','tb_modalidade.descricao as modalidade',
                        'tb_aluno.endereco_telefone','tb_aluno.status', 'tb_aluno.data_nascimento'
                        
                ).then(result=>{
				    knex('tb_nucleo').select().then(nucleos=>{
                        res.render('adm/alunos',{
                            title,
                            logo: 'IBADEJUF',
                            Alunos: result,
                            user: dados[0].nome,
                            uid_usuario,
                            nucleos,
						    descricao_nucleo: "",
                            titulo_pagina: 'Aniversariantes do Mês de ' + retornaDescricaoMes(mes),
                            botoes_aniversariantes:1
                        })
                    })
                })
            })        
        })
    }
})



router.get('/adm/alunos_1_basico/:uid_usuario',(req,res)=>{
    const { uid_usuario } = req.params;

    knex('tb_usuario').where({uid_usuario: uid_usuario}).select().then(result=>{
        knex('tb_aluno').where({id_aluno: result[0].id_aluno}).select().then(dados=>{
            knex('tb_aluno')
            .where('tb_aluno.id_aluno','>', '1' )
            .andWhere('tb_usuario.id_nivel','<>','1')
            .andWhere('tb_modulo.id_modulo','1')
            .leftJoin('tb_modulo','tb_modulo.id_modulo','tb_aluno.id_modulo')
            .leftJoin('tb_modalidade','tb_modalidade.id_modalidade','tb_aluno.id_modalidade')
            .innerJoin('tb_usuario','tb_usuario.id_aluno','tb_aluno.id_aluno')
            .select('tb_aluno.id_aluno','tb_aluno.cpf','tb_aluno.nome','tb_aluno.email',
                        'tb_modulo.descricao as modulo','tb_modalidade.descricao as modalidade',
                        'tb_aluno.endereco_telefone','tb_aluno.status','tb_aluno.data_nascimento'
                        
            ).then(result=>{
				console.log(result)
				knex('tb_nucleo').select().then(nucleos=>{
                    res.render('adm/alunos',{
                        title,
                        logo: 'IBADEJUF',
                        Alunos: result,
                        user: dados[0].nome,
                        uid_usuario,
                        nucleos,
						descricao_nucleo: "",
                        titulo_pagina: "Alunos do 1º Ano",
                        botoes_aniversariantes:0
                    })
                })
            })
        })        
    })
})


router.get('/adm/alunos_2_basico/:uid_usuario',(req,res)=>{
    const { uid_usuario } = req.params;

    knex('tb_usuario').where({uid_usuario: uid_usuario}).select().then(result=>{
        knex('tb_aluno').where({id_aluno: result[0].id_aluno}).select().then(dados=>{
            knex('tb_aluno')
            .where('tb_aluno.id_aluno','>', '1' )
            .andWhere('tb_usuario.id_nivel','<>','1')
            .andWhere('tb_modulo.id_modulo','2')
            .leftJoin('tb_modulo','tb_modulo.id_modulo','tb_aluno.id_modulo')
            .leftJoin('tb_modalidade','tb_modalidade.id_modalidade','tb_aluno.id_modalidade')
            .innerJoin('tb_usuario','tb_usuario.id_aluno','tb_aluno.id_aluno')
            .select('tb_aluno.id_aluno','tb_aluno.cpf','tb_aluno.nome','tb_aluno.email',
                        'tb_modulo.descricao as modulo','tb_modalidade.descricao as modalidade',
                        'tb_aluno.endereco_telefone','tb_aluno.status','tb_aluno.data_nascimento'
                        
            ).then(result=>{
				knex('tb_nucleo').select().then(nucleos=>{
                    res.render('adm/alunos',{
                        title,
                        logo: 'IBADEJUF',
                        Alunos: result,
                        user: dados[0].nome,
                        uid_usuario,
                        nucleos,
						descricao_nucleo: "",
                        titulo_pagina: "Alunos do 2º Ano",
                        botoes_aniversariantes:0
                    })
                })
            })
        })        
    })  

})
router.get('/adm/alunos_medio/:uid_usuario',(req,res)=>{
    const { uid_usuario } = req.params;

    knex('tb_usuario').where({uid_usuario: uid_usuario}).select().then(result=>{
        knex('tb_aluno').where({id_aluno: result[0].id_aluno}).select().then(dados=>{
            knex('tb_aluno')
            .where('tb_aluno.id_aluno','>', '1' )
            .andWhere('tb_usuario.id_nivel','<>','1')
            .andWhere('tb_modulo.id_modulo','3')
            .leftJoin('tb_modulo','tb_modulo.id_modulo','tb_aluno.id_modulo')
            .leftJoin('tb_modalidade','tb_modalidade.id_modalidade','tb_aluno.id_modalidade')
            .innerJoin('tb_usuario','tb_usuario.id_aluno','tb_aluno.id_aluno')
            .select('tb_aluno.id_aluno','tb_aluno.cpf','tb_aluno.nome','tb_aluno.email',
                        'tb_modulo.descricao as modulo','tb_modalidade.descricao as modalidade',
                        'tb_aluno.endereco_telefone','tb_aluno.status','tb_aluno.data_nascimento'
                        
            ).then(result=>{
				knex('tb_nucleo').select().then(nucleos=>{
                    res.render('adm/alunos',{
                        title,
                        logo: 'IBADEJUF',
                        Alunos: result,
                        user: dados[0].nome,
                        uid_usuario,
                        nucleos,
						descricao_nucleo: "",
                        titulo_pagina: "Alunos do Médio",
                        botoes_aniversariantes:0
                    })
                })
            })
        })        
    })  

})
router.get('/adm/alunos/:uid_usuario', (req,res)=>{ 
    const { uid_usuario } = req.params;

    knex('tb_usuario').where({uid_usuario: uid_usuario}).select().then(result=>{
		
        knex('tb_aluno').where({id_aluno: result[0].id_aluno}).select().then(dados=>{
            knex('tb_aluno')
            //.where('tb_usuario.id_nivel','<>','1')
            //.andWhere('tb_usuario.id_nivel','=','3')
            .leftJoin('tb_modulo','tb_modulo.id_modulo','tb_aluno.id_modulo')
            .leftJoin('tb_nucleo','tb_nucleo.id_nucleo','tb_aluno.id_nucleo')
            .leftJoin('tb_modalidade','tb_modalidade.id_modalidade','tb_aluno.id_modalidade')
            .innerJoin('tb_usuario','tb_usuario.id_aluno','tb_aluno.id_aluno')
            .select('tb_aluno.id_aluno','tb_aluno.cpf','tb_aluno.nome','tb_aluno.email',
                        'tb_modulo.descricao as modulo','tb_modalidade.descricao as modalidade',
                        'tb_aluno.endereco_telefone','tb_aluno.status','tb_nucleo.descricao as nucleo','tb_aluno.data_nascimento'
                        
            ).then(result=>{
				knex('tb_nucleo').select().then(nucleos=>{
                    res.render('adm/alunos',{
                        title,
                        logo: 'IBADEJUF',
                        Alunos: result,
                        user: dados[0].nome,
                        uid_usuario,
                        nucleos,
						descricao_nucleo: "",
                        titulo_pagina: "",
                        botoes_aniversariantes:0
                    })
                })
            })
        })        
    })       
})

router.get('/adm/alunosBl/:uid_usuario', (req,res)=>{ 
    const { uid_usuario } = req.params;

    knex('tb_usuario').where({uid_usuario: uid_usuario}).select().then(result=>{
		
        knex('tb_aluno').where({id_aluno: result[0].id_aluno}).select().then(dados=>{
            knex('tb_aluno')
            .where('tb_usuario.id_nivel','<>','1')
            .andWhere('tb_aluno.status','=','1')
            .leftJoin('tb_modulo','tb_modulo.id_modulo','tb_aluno.id_modulo')
            .leftJoin('tb_nucleo','tb_nucleo.id_nucleo','tb_aluno.id_nucleo')
            .leftJoin('tb_modalidade','tb_modalidade.id_modalidade','tb_aluno.id_modalidade')
            .innerJoin('tb_usuario','tb_usuario.id_aluno','tb_aluno.id_aluno')
            .select('tb_aluno.id_aluno','tb_aluno.cpf','tb_aluno.nome','tb_aluno.email',
                        'tb_modulo.descricao as modulo','tb_modalidade.descricao as modalidade',
                        'tb_aluno.endereco_telefone','tb_aluno.status','tb_nucleo.descricao as nucleo','tb_aluno.data_nascimento'
                        
            ).then(result=>{
				knex('tb_nucleo').select().then(nucleos=>{
                    res.render('adm/alunos',{
                        title,
                        logo: 'IBADEJUF',
                        Alunos: result,
                        user: dados[0].nome,
                        uid_usuario,
                        nucleos,
						descricao_nucleo: "",
                        titulo_pagina: "",
                        botoes_aniversariantes:0
                    })
                })
            })
        })        
    })       
})


router.get('/adm/addAluno/:uid_usuario', (req,res)=>{ 
    const { uid_usuario } = req.params;

    knex('tb_usuario').where({uid_usuario: uid_usuario}).select().then(result=>{
        knex('tb_aluno').where({id_aluno: result[0].id_aluno}).select().then(dados_user=>{
            knex('tb_modalidade').select().then(modalidades=>{
                knex("tb_modulo").select().then((modulo) => {
                    knex("tb_nucleo").select().then((nucleo) => {
                        knex('tb_nucleo').select().then(nucleos=>{
                            res.render("adm/addAluno", {
                                title,
                                logo: 'IBADEJUF',
                                title_page: title_adm,
                                abrir_aviso: false,
                                abrir_aviso_opcao: "danger",
                                mensagem_modal: "Aluno já cadastrado",
                                modulo: modulo,
                                nucleo,
                                modalidade: modalidades,
                                user: dados_user[0].nome,
                                uid_usuario,
                                nucleos
                            });
                        })
                    })
                });
            })
        })
    })
})
router.post("/adm/addAluno", (req, res) => {
    const {nome, email,cpf, rg, nascimento, 
            nome_pai, nome_mae,escolaridade, 
            profissao,denominacao,batizado,telefone ,
            naturalidade, cep, endereco, numero, complemento,
            bairro, cidade, uf, id_modulo, id_modalidade, uid_usuario, id_nucleo,  administrador, administrador_geral} = req.body;

            
            const data = dayjs(); // Data e hora atuais
            const dataFormatada = data.format('YYYY-MM-DD');

            console.log(nascimento); // Exemplo: 2024-05-16
            
            let nascimento_banco ="";
			//console.log(typeof(nascimento))
			console.log(FormataStringData(nascimento));
			if(nascimento===undefined || nascimento==="" || nascimento==null || nascimento==NaN || nascimento==""){
				const dataDiaFormatada = data.format('DD/MM/YYYY');

				nascimento_=dataDiaFormatada;
				nascimento_banco = dataFormatada;
			}else{
				nascimento_banco =FormataStringData(nascimento);
				nascimento_ = nascimento;
				
			}

			try{
				knex("tb_aluno").where({ cpf: cpf }).select().then((result) => {
					if (result.length > 0) {
						res.send('Aluno ja Cadstrado')
						return;
					
					} else {
                
						knex("tb_aluno")
							.insert({
								nome: nome,
								email: email,
								cpf: cpf,
								rg: rg,
								data_nascimento: nascimento_,
								data_nascimento_banco : nascimento_banco,
								nome_pai: nome_pai,
								nome_mae: nome_mae,
								natural: naturalidade,
								escolaridade: escolaridade,
								profissao: profissao,	
								denominacao: denominacao,
								batismo_aguas: batizado,
								endereco_cep: cep,
								endereco_rua: endereco,
								endereco_numero: numero,
								endereco_complemento: complemento,
								endereco_bairro: bairro,
								endereco_cidade: cidade,
								endereco_uf: uf,
								endereco_telefone: telefone,
								endereco_celular: telefone,
								observacao: "",
								status: "0",
								id_modulo: id_modulo,
								id_modalidade: id_modalidade,
								id_nucleo: id_nucleo
						})
						.returning("id_aluno")
						.then((result) => {
						let id_aluno_inserted = result[0];
						console.log('id do aluno inserido'+id_aluno_inserted)					
					
						knex("tb_aluno").where({id_aluno: id_aluno_inserted}).update({id_aluno_hash: uid2(32)}).then((result) => {});
							let _cpf = base64.encode(cpf);
							let _senha = base64.encode('123');
                            
							if(administrador_geral=="true"){
								knex("tb_usuario")
                                .insert({
                                    usuario: _cpf,
                                    senha : _senha,
                                    descricao: nome,
                                    email: email,
                                    id_nivel: 1,
                                    id_aluno: id_aluno_inserted,
                                    uid_usuario: uid2(10)

                                })
						        .then((result) => {});
							}
							if(administrador=="true"){
                                knex("tb_usuario")
                                .insert({
                                    usuario: _cpf,
                                    senha : _senha,
                                    descricao: nome,
                                    email: email,
                                    id_nivel: 3,
                                    id_aluno: id_aluno_inserted,
                                    uid_usuario: uid2(10)

                                })
						        .then((result) => {});
                            }
							if(administrador=="false" & administrador_geral=="false"){
                                knex("tb_usuario")
                                .insert({
                                    usuario: _cpf,
                                    senha : _senha,
                                    descricao: nome,
                                    email: email,
                                    id_nivel: 2,
                                    id_aluno: id_aluno_inserted,
                                    uid_usuario: uid2(10)

                                })
						        .then((result) => {});
                            }
						console.log('cadastrou')
						res.send('Aluno cadastrado com Sucesso');
                    //res.redirect('/adm/alunos/'+uid_usuario)
            });
        }
      });
    } catch (error) {
        knex('tb_modalidade').select().then(modalidades=>{
            knex("tb_modulo").select().then((result) => {
                if (result.length > 0) {
                    res.render("adm/addAluno", {
                        logo: 'IBADEJUF',
                        abrir_modal_aviso: true,
                        mensagem_modal: error,
                        nivel_curso: result,
                        modalidade: modalidades,
                        title
                    });
                }
            })
        });
    } 
});
router.post('/adm/busca_aluno_cpf',(req,res)=>{
    const { cpf, uid_usuario } = req.body;
    knex('tb_usuario').where({uid_usuario: uid_usuario}).select().then(dados=>{
        knex('tb_aluno').where({ cpf: cpf}).select().then(result=>{
            
            if(result.length==0){
                res.redirect('/adm/alunos/'+uid_usuario)
            }    
        })
    })

    
    //res.send(cpf)
})


router.get('/adm/editAluno/:id_aluno/:uid_usuario', (req,res)=>{ 
    const { id_aluno, uid_usuario  } = req.params;

    knex('tb_usuario').where({uid_usuario: uid_usuario}).select().then(result_usuario=>{
        knex('tb_aluno').where({id_aluno: result_usuario[0].id_aluno}).select().then(dados_user=>{
            knex('tb_aluno')
            .innerJoin('tb_usuario','tb_usuario.id_aluno','tb_aluno.id_aluno')
			.leftJoin('tb_modalidade','tb_modalidade.id_modalidade','tb_aluno.id_modalidade')
			.leftJoin('tb_modulo','tb_modulo.id_modulo','tb_aluno.id_modulo')
            .leftJoin('tb_nucleo','tb_nucleo.id_nucleo','tb_aluno.id_nucleo')
			.where('tb_aluno.id_aluno', id_aluno).select(
					'tb_aluno.id_aluno',
					'tb_aluno.nome',
					'tb_aluno.email',
					'tb_aluno.cpf',
					'tb_aluno.rg',
					'tb_aluno.data_nascimento',
					'tb_aluno.nome_pai',
					'tb_aluno.nome_mae',
					'tb_aluno.natural',
					'tb_aluno.escolaridade',
					'tb_aluno.profissao',
					'tb_aluno.denominacao',
					'tb_aluno.batismo_aguas',
					'tb_aluno.endereco_cep',
					'tb_aluno.endereco_rua',
					'tb_aluno.endereco_numero',
					'tb_aluno.endereco_complemento',
					'tb_aluno.endereco_bairro',
					'tb_aluno.endereco_cidade',
					'tb_aluno.endereco_uf',
					'tb_aluno.endereco_telefone',
					'tb_aluno.endereco_celular',
					'tb_aluno.observacao',
					'tb_aluno.status',
					'tb_aluno.id_modulo',
					'tb_aluno.id_aluno_hash',
					'tb_aluno.id_modalidade',
					'tb_modalidade.descricao as modalidade',
					'tb_modulo.descricao as modulo',
                    'tb_nucleo.id_nucleo', 'tb_nucleo.descricao', 'tb_usuario.id_nivel'
			
			).then(dados=>{
				//console.log(dados)
				
                knex('tb_modalidade').select().then(modalidades=>{
                    knex("tb_modulo").select().then((modulo) => {
						knex("tb_nucleo").select().then((nucleos) => {

                            

                                res.render("adm/editAluno", {
                                    title,
                                    logo: 'IBADEJUF',
                                    title_page: title_adm,
                                    abrir_aviso: false,
                                    abrir_aviso_opcao: "danger",
                                    mensagem_modal: "Aluno já cadastrado",
                                    modulo: modulo,
                                    modalidade: modalidades,
                                    Aluno: dados,
                                    id_modalidade: dados[0].id_modalidade,
                                    id_nucleo: dados[0].id_nucleo,
                                    descricao_nucleo: dados[0].descricao,
                                    nucleos,
                                    descricao_modalidade: dados[0].modalidade,
                                    id_modulo: dados[0].id_modulo,
                                    descricao_modulo: dados[0].modulo,
                                    administrador :dados[0].id_nivel,
                                    user: dados_user[0].nome,
                                    uid_usuario,
                                    nucleos,
									id_aluno: dados[0].id_aluno
                                });        
                            
                        })
                    });
                })	    
            })
        })

        
    })
})

router.post("/adm/editAluno", (req, res) => {
    const {nome, email,cpf, rg, nascimento, 
            nome_pai, nome_mae,escolaridade, 
            profissao,denominacao,batismo_aguas,telefone ,
            naturalidade, cep, endereco, numero, complemento,
            bairro, cidade, uf, id_modulo, id_modalidade, uid_usuario, id_nucleo, id_aluno,administrador, administrador_geral} = req.body;

		
            const data = dayjs(); // Data e hora atuais
            const dataFormatada = data.format('YYYY-MM-DD');
            let nascimento_banco ="";
			if(nascimento===undefined || nascimento==="" || nascimento==null || nascimento==NaN || nascimento==""){
				const dataDiaFormatada = data.format('DD/MM/YYYY');

				nascimento_=dataDiaFormatada;
				nascimento_banco = dataFormatada;
			}else{
				nascimento_banco =FormataStringData(nascimento);
				nascimento_ = nascimento;
				
			}
            
			console.log("Nucelo"+administrador)
			console.log("Geral"+administrador_geral)
			
			let nivel = 0;
			
			if (administrador=="true"){
				nivel ="3"
			}
			if (administrador_geral=="true"){
				nivel ="1"
			}
			if(administrador=="false" & administrador_geral=="false"){
				nivel ="2"
			}	
			
			console.log(nivel)
			knex("tb_usuario").where({ id_aluno: id_aluno })
			.update({
				id_nivel: nivel
			}).then(result=>{
				console.log('Dados alterados')
				res.send("Dados alterados")
				//res.redirect('/adm/alunos/'+uid_usuario)    
			})
			
			try{
				knex("tb_aluno").where({ id_aluno: id_aluno }).select().then((result) => {
					//console.log(result)
					knex("tb_aluno").where({ id_aluno: id_aluno })
						.update({
							nome: nome,
							email: email,
							cpf: cpf,
							rg: rg,
							data_nascimento: nascimento,
							data_nascimento_banco : nascimento_banco,
							nome_pai: nome_pai,
							nome_mae: nome_mae,
							natural: naturalidade,
							escolaridade: escolaridade,
							profissao: profissao,	
							denominacao: denominacao,
							batismo_aguas: batismo_aguas,
							endereco_cep: cep,
							endereco_rua: endereco,
							endereco_numero: numero,
							endereco_complemento: complemento,
							endereco_bairro: bairro,
							endereco_cidade: cidade,
							endereco_uf: uf,
							endereco_telefone: telefone,
							endereco_celular: telefone,
							observacao: "",
							status: "0",
							id_modulo: id_modulo,
							id_modalidade: id_modalidade,
							id_nucleo: id_nucleo
					})
					.then((result) => {
						

						
					});
				
			  });
			} catch (error) {
				res.redirect('/adm/alunos/'+uid_usuario)
			} 
            
});

router.get('/adm/rem_alunos/:id_aluno/:uid_usuario', (req,res)=>{ 
    const { id_aluno, uid_usuario } = req.params;
      
	  
	//res.status(200).send({mensagem : "Aluno Excluido com sucesso"});
	
	try{  
		knex('tb_aluno').where({id_aluno: id_aluno}).del().then(result=>{
			knex('tb_usuario').where({id_aluno: id_aluno}).del().then(result=>{
				//res.redirect('/adm/alunos/'+uid_usuario) 
				res.status(200).send({mensagem : "Aluno Excluido com sucesso"});				
			})
		})
	}catch(error){
		console.log(error)
		
	}
})

router.get('/adm/bloquear_alunos/:id_aluno/:uid_usuario', (req,res)=>{ 
    const { id_aluno, uid_usuario } = req.params;
    

    knex('tb_aluno').where({id_aluno : id_aluno}).update({
        status : 1
    }).then(result=>{
        res.redirect('/adm/alunos/'+uid_usuario)        
    })
})

router.get('/adm/desbloquear_alunos/:id_aluno/:uid_usuario', (req,res)=>{ 
    const { id_aluno, uid_usuario } = req.params;
    
    knex('tb_aluno').where({id_aluno : id_aluno}).update({
        status : 0
    }).then(result=>{
        res.redirect('/adm/alunos/'+uid_usuario)        
    })
})



//INICIO AULAS ------------------------------------------------------------------
router.get('/adm/aulas/:uid_usuario', (req,res)=>{ 
    const { id_aluno, uid_usuario } = req.params;

    knex('tb_usuario').where({uid_usuario: uid_usuario}).select().then(result_usuario=>{
        
            knex('tb_aulas')
            .innerJoin('tb_modulo','tb_modulo.id_modulo','tb_aulas.id_modulo')    
            .select('tb_aulas.ordem','tb_aulas.id_aulas','tb_aulas.descricao','tb_aulas.link','tb_modulo.descricao as modulo')
            .orderBy('tb_aulas.ordem')
            .then(result=>{
                knex('tb_nucleo').select().then(nucleos=>{
                    res.render('adm/aulas',{
                        title,
                        Aulas : result,
                        user: result_usuario[0].descricao,
                        uid_usuario,
                        nucleos
                    })
                })

        
        })
    })
})

router.get('/adm/rem_aulas/:id_aulas/:uid_usuario',(req,res)=>{  
    const { id_aulas, uid_usuario } = req.params;

    knex('tb_aulas').where({id_aulas: id_aulas}).del().then(result=>{
        console.log(result)
        res.redirect('/adm/addAulas/'+uid_usuario)
    })

})


router.get('/adm/addAulas/:uid_usuario', (req,res)=>{ 
    const { id_aluno, uid_usuario } = req.params;

    knex('tb_usuario').where({uid_usuario: uid_usuario}).select().then(result_usuario=>{
        knex('tb_aulas')
        .innerJoin('tb_modulo','tb_modulo.id_modulo','tb_aulas.id_modulo')
		.innerJoin('tb_materia','tb_materia.id_materia','tb_aulas.id_materia')
        .select('tb_materia.id_materia ','tb_materia.descricao as materia ','tb_aulas.ordem','tb_aulas.descricao','tb_aulas.link','tb_modulo.descricao as modulo','tb_aulas.id_aulas','tb_aulas.ordem')
        .orderBy('tb_aulas.ordem')
        .then(result=>{
            knex("tb_materia").select().then((materia) => {
				knex("tb_modulo").select().then((modulo) => {
                    knex('tb_nucleo').select().then(nucleos=>{
                        res.render('adm/addAulas',{
                            title,
                            materia,
                            modulo,
                            Aulas: result,
                            user: result_usuario[0].descricao,
                            uid_usuario,
                            nucleos
                        })
                    })
				})
            })
        })
    })
})

router.post('/adm/addAulas', (req,res)=>{ 
    const{ descricao, id_modulo, link, ordem_aula, uid_usuario, id_materia} = req.body;

    //'const link = '<iframe width="560" height="315" src="https://www.youtube.com/embed/7DUidwYLVok?si=NxlgDOcbByxv7VOs" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>' // Try edit me
    
    let inicio =link.indexOf("src")+5;
    let fim = link.indexOf("title")-2

    let link_novo = link.substring(inicio,fim)
    let inicio_img =link.indexOf("embed/")+6;
    let fim_img = link.indexOf("?si")

    let img_id = link.substring(inicio_img,fim_img)


	console.log(uid_usuario)
	console.log(ordem_aula)
	console.log(descricao)
	console.log(id_materia)
	console.log(link)
	

    knex("tb_aulas").insert({
        descricao: descricao,
        id_modulo: id_modulo,
		id_materia: id_materia, 
        link: link_novo,
        img: img_id,
        ordem: ordem_aula

    }).then(modulo => {
        
        //res.redirect('/adm/addAulas/'+uid_usuario)
		res.send('Aula Cadastrada com Sucesso')
    })
            
})





//UNSER ------------------------------------------------------------------
router.get('/adm/addUser/:uid_usuario',(req,res)=>{
    const {uid_usuario } = req.params;
    knex('tb_usuario').where({uid_usuario: uid_usuario}).select().then(result_usuario=>{
        knex('tb_usuario').where({id_nivel: 1}).select().then(users=>{
            knex('tb_nucleo').select().then(nucleos=>{
                res.render('adm/addUser',{
                    title,
                    Users: users,
                    user: result_usuario[0].descricao,
                    uid_usuario ,
                    nucleos
                })
            })
        })
    })    
})

router.post('/adm/addUser/',(req,res)=>{
    const { cpf, descricao, email, uid_usuario } = req.body;

    knex('tb_usuario').insert({
        descricao: descricao,
        email: email,
        usuario: base64.encode(cpf),
        senha: base64.encode('123'),
        id_nivel: 1,
        uid_usuario: uid2(10)
    }).then(result_usuario=>{
        
        knex('tb_aluno').insert({
            nome: descricao,
            email: email
        }).then(result_aluno=>{
            console.log(result_aluno[0])

            knex('tb_usuario').where({id_usuario: result_usuario[0]  }).update({
                id_aluno: result_aluno[0]
            }).then(result=>{

                console.log('user adicionado com sucesso')
                res.redirect('/adm/addUser/'+uid_usuario)
    
            })

    
        })

    })


})

router.get('/adm/remUsers/:id_usuario/:uid_usuario',(req,res)=>{
    const { id_usuario, uid_usuario } = req.params;

    knex('tb_usuario').where({ id_usuario : id_usuario}).del().then(result=>{
        res.redirect('/adm/AddUser/'+uid_usuario)
    })

})







router.get('/adm/nota_aluno/:cpf',(req,res)=>{
    const { cpf } = req.params;

    res.send('notas')
})


router.get('/adm/presenca_aluno/:id_aluno',(req,res)=>{
    const { id_aluno } = req.params;
    knex('tb_aluno').where({id_aluno : id_aluno}).select().then(dados_aluno=>{
        knex('vw_presenca_aulas_aluno').where({id_aluno : id_aluno})
        .select().then(result=>{
            knex('tb_nucleo').select().then(nucleos=>{
                res.render('adm/presenca',{
                    title,
                    logo: 'IBADEJUF',
                    Aulas: result,
                    Aluno: dados_aluno[0].nome,
                    nucleos
                })
            })
        })

    })
    
})


router.get('/adm/addModalidades/:uid_usuario', (req,res)=>{ 
    const { uid_usuario } = req.params;
    knex('tb_usuario').where({uid_usuario: uid_usuario}).select().then(result_usuario=>{
        knex('tb_modalidade')
        .select().then(result=>{    
            knex('tb_nucleo').select().then(nucleos=>{    
                res.render('adm/addModalidades',{
                    title,
                    Modalidade : result,
                    user: result_usuario[0].descricao,
                    uid_usuario,
                    nucleos
                })
            })
        })            
    })
})


router.get('/adm/rem_modalidade/:id_modalidade/:uid_usuario',(req,res)=>{
    const { id_modalidade, uid_usuario } = req.params;

    knex('tb_modalidade').where({id_modalidade: id_modalidade}).del().then(result=>{
         res.redirect('/adm/addModalidades/'+uid_usuario)
    })
})

router.post('/adm/addModalidade',(req,res)=>{
    const { modalidade, uid_usuario } = req.body;

    knex('tb_modalidade').insert({
        descricao: modalidade
    }).then(result=>{
		console.log('adicionado a modalidade');
        res.redirect('/adm/addModalidades/'+uid_usuario)
    })
})


function dataDia (){
	var data = new Date();

	// Guarda cada pedaço em uma variável
	var dia     = data.getDate();           // 1-31
	var dia_sem = data.getDay();            // 0-6 (zero=domingo)
	var mes     = data.getMonth();          // 0-11 (zero=janeiro)
	var ano2    = data.getYear();           // 2 dígitos
	var ano4    = data.getFullYear();       // 4 dígitos
	var hora    = data.getHours();          // 0-23
	var min     = data.getMinutes();        // 0-59
	var seg     = data.getSeconds();        // 0-59
	var mseg    = data.getMilliseconds();   // 0-999
	var tz      = data.getTimezoneOffset(); // em minutos
	
	// Formata a data e a hora (note o mês + 1)
	//var str_data = dia + '/' + (mes+1) + '/' + ano4;
	var str_data = ano4 + '-' + (mes+1) + '-' + dia;
	var str_hora = hora + ':' + min + ':' + seg;
	
	
	var str_data = dia + '/' + (mes+1) + '/' +  ano4;
	// Mostra o resultado
	//alert('Hoje é ' + str_data + ' às ' + str_hora);
	//return str_data + ' ' +str_hora;
	return str_data;

}


function FormataStringData(data) {
  var dia  = data.split("/")[0];
  var mes  = data.split("/")[1];
  var ano  = data.split("/")[2];

  return ano+("0"+mes).slice(-2)+("0"+dia).slice(-2);
  // Utilizo o .slice(-2) para garantir o formato com 2 digitos.
}




router.post('/adm/addFornecedor',(req,res)=>{
	const { uid_usuario, fornecedor} = req.body;
	
	knex('tb_fornecedor').insert({
		nome: fornecedor
	})		
	.then(result=>{		
		knex('tb_usuario').where({uid_usuario: uid_usuario}).select().then(result=>{
			knex('tb_contas').select().then(contas=>{
				knex('tb_fornecedor').select().then(fornecedor=>{
					knex('tb_contas_pagar').sum('valor_total AS valor_total').where('data_pagamento', '<>', '1902-01-01 00:00:00').select().then(vlr_contas_pagas=>{
						
						knex('tb_contas_pagar').sum('valor_total AS valor_total_a_pagar').where('data_pagamento', '=', '1902-01-01 00:00:00').select().then(vlr_contas_a_pagar=>{
						
							knex('vw_contas_pagar').select().then(contas_a_pagar=>{
								res.render("adm/contasPagar", {
									title,
									logo: 'IBADEJUF',
									title_page: title_adm,
									abrir_aviso: false,
									abrir_aviso_opcao: "danger",
									mensagem_modal: "Aluno já cadastrado",
									user: "",
									uid_usuario,
									fornecedor,
									contas,
									contas_a_pagar,
									vlr_contas_pagas: vlr_contas_pagas[0].valor_total,
									vlr_contas_a_pagar: vlr_contas_a_pagar[0].valor_total_a_pagar
								});        
								
							})
						})
					})	
				})   
			})
		})
		
		
	})
})


router.post('/adm/addConta',(req,res)=>{
	const { uid_usuario, conta} = req.body;
	
	knex('tb_contas').insert({
		descricao: conta
	})		
	.then(result=>{
		knex('tb_usuario').where({uid_usuario: uid_usuario}).select().then(result=>{
			knex('tb_contas').select().then(contas=>{
				knex('tb_fornecedor').select().then(fornecedor=>{
					knex('tb_contas_pagar').sum('valor_total AS valor_total').where('data_pagamento', '<>', '1902-01-01 00:00:00').select().then(vlr_contas_pagas=>{
						
						knex('tb_contas_pagar').sum('valor_total AS valor_total_a_pagar').where('data_pagamento', '=', '1902-01-01 00:00:00').select().then(vlr_contas_a_pagar=>{
						
							knex('vw_contas_pagar').select().then(contas_a_pagar=>{
								res.render("adm/contasPagar", {
									title,
									logo: 'IBADEJUF',
									title_page: title_adm,
									abrir_aviso: false,
									abrir_aviso_opcao: "danger",
									mensagem_modal: "Aluno já cadastrado",
									user: "",
									uid_usuario,
									fornecedor,
									contas,
									contas_a_pagar,
									vlr_contas_pagas: vlr_contas_pagas[0].valor_total,
									vlr_contas_a_pagar: vlr_contas_a_pagar[0].valor_total_a_pagar
								});        
								
							})
						})
					})	
				})   
			})
		})
		
	})
})




router.get('/adm/addMaterias/:uid_usuario', (req,res)=>{
    const { uid_usuario } = req.params;

    knex('tb_usuario').where({uid_usuario: uid_usuario}).select().then(result=>{
        knex('tb_aluno').where({id_aluno: result[0].id_aluno}).select().then(dados_aluno=>{
			knex('tb_aluno').count('id_aluno as qtde').select().then(qtdeAlunos=>{
				knex("tb_modulo").select().then((modulo) => {
					knex('vw_materias_modulos')
					//.innerJoin('tb_modulo','tb_modulo.id_modulo','tb_materia.id_modulo')
					//.leftJoin('tb_aulas','tb_aulas.id_materia','tb_materia.id_materia')
					
					.select('id_materia','materia','modulo', 'qtde'
					//knex.raw('select count(id_aulas) as qtde, id_materia from tb_aulas ta group by id_materia;')
					).then(materias=>{
						knex('tb_nucleo').select().then(nucleos=>{
						
                            res.render('adm/addMaterias',{
                                title,
                                logo: 'IBADEJUF',
                                logo_site: title,
                                materias,
                                modulo,
                                user: dados_aluno[0].nome,
                                uid_usuario,
                                nucleos
                            })
                        })
					})
				})
			})
        })
    })
})


router.post('/adm/addMateria',(req,res)=>{
	const {nome, id_modulo, uid_usuario} = req.body;
	
	knex('tb_materia').insert({
		descricao: nome,
		id_modulo: id_modulo		
	}).then(result=>{
		res.redirect('/adm/addMaterias/'+uid_usuario)
	})
	
})


router.get('/adm/remMaterias/:id_materia/:uid_usuario',(req,res)=>{
	const {id_materia, uid_usuario}= req.params;
	
	knex('tb_materia').where({id_materia : id_materia}).del().then(result=>{
		res.redirect('/adm/addMaterias/'+uid_usuario)
	})
	
	
})



router.get('/adm/aulas_materia_visualizar/:id_materia/:uid_usuario/:id_aula',(req,res)=>{
	const { id_aula, id_materia, uid_usuario } = req.params;
	
	knex('tb_usuario').where({uid_usuario: uid_usuario}).select().then(result_user=>{
        knex('tb_aluno').where({id_aluno: result_user[0].id_aluno}).select().then(aluno=>{
			knex('tb_aulas').where({ id_aulas: id_aula}).select().then(aulas=>{
				knex('tb_materia').where({ id_materia: id_materia}).select().then(materia=>{
					knex('tb_presenca_aula_aluno').where({ id_aula: id_aula}).andWhere({id_aluno: aluno[0].id_aluno}).select().then(presenca=>{
						console.log(presenca)
						if(presenca.length=="0"){
							knex('tb_nucleo').select().then(nucleos=>{
								res.render('adm/aulas_materia_visualizar',{
									aulas,
									botao_concluir_aula: true,
									link: aulas[0].link,
									nome_aula: aulas[0].descricao,
									id_aula: aulas[0].id_aulas,
									nome_materia: materia[0].descricao,
									id_materia: materia[0].id_materia,
									logo: 'IBADEJUF',
									id_aluno: result_user[0].id_aluno,
									title,
									user: aluno[0].nome,
									uid_usuario,
									nucleos
								})			
							})
						}else{
							knex('tb_nucleo').select().then(nucleos=>{
								res.render('adm/aulas_materia_visualizar',{
									aulas,
									botao_concluir_aula: false,
									link: aulas[0].link,
									nome_aula: aulas[0].descricao,
									id_aula: aulas[0].id_aulas,
									nome_materia: materia[0].descricao,
									id_materia: materia[0].id_materia,
									logo: 'IBADEJUF',
									id_aluno: result_user[0].id_aluno,
									title,
									user: aluno[0].nome,
									uid_usuario,
									nucleos
								})	
							})
						}
					})			
				})
			})	
        }) 
    })
})



router.get('/adm/aulas_materia/:uid_usuario/:id_materia',(req,res)=>{
	const { uid_usuario, id_materia} = req.params;
	
	knex('tb_usuario').where({uid_usuario: uid_usuario}).select().then(result_usuario=>{
        knex('tb_aulas').where('tb_materia.id_materia' , id_materia)
        .innerJoin('tb_modulo','tb_modulo.id_modulo','tb_aulas.id_modulo')
		.innerJoin('tb_materia','tb_materia.id_materia','tb_aulas.id_materia')
        .select('tb_materia.id_materia ','tb_materia.descricao as materia ','tb_aulas.ordem','tb_aulas.descricao','tb_aulas.link','tb_modulo.descricao as modulo','tb_aulas.id_aulas','tb_aulas.ordem')
        .then(result=>{
			console.log(result)
            knex("tb_materia").select().then((materia) => {
				knex("tb_modulo").select().then((modulo) => {
                    knex('tb_nucleo').select().then(nucleos=>{
                        res.render('adm/aulas_materia',{
                            title,
                            materia,
                            modulo,
                            Aulas: result,
                            user: result_usuario[0].descricao,
                            uid_usuario,
                            nucleos
                        })
                    })
				})
            })
        })
    })
	
})


router.get('/adm/presencas/:id_aluno/:uid_usuario',(req,res)=>{
	const { id_aluno, uid_usuario} = req.params;
	
	knex('tb_usuario').where({uid_usuario: uid_usuario}).select().then(result_usuario=>{
		knex('tb_aluno').where({id_aluno: id_aluno}).select().then(dados_aluno=>{
		
			knex('vw_presenca').where('vw_presenca.id_aluno' , id_aluno)
			.select()
			.then(result=>{
				knex('tb_nucleo').select().then(nucleos=>{
                    res.render('adm/presencas',{
                        title,
                        Aluno : dados_aluno[0].nome,
                        Aulas: result,
                        user: result_usuario[0].descricao,
                        uid_usuario,
						nucleos
                    })
                })
			})
		})
    })
	
	
})

function retornaNomeMes(){
	let mesAtual = dayjs().month();
	
	if(mesAtual==0){
		mes="Janeiro"
	}
	if(mesAtual==1){
		mes="Fevereiro"
	}
	if(mesAtual==2){
		mes="Março"
	}
	if(mesAtual==3){
		mes="Abril"
	}
	if(mesAtual==4){
		mes="Maio"
	}
	if(mesAtual==5){
		mes="Junho"
	}
	if(mesAtual==6){
		mes="Julho"
	}
	if(mesAtual==7){
		mes="Agosto"
	}
	if(mesAtual==8){
		mes="Setembro"
	}
	if(mesAtual==9){
		mes="Outubro"
	}
	if(mesAtual==10){
		mes="Novembro"
	}
	if(mesAtual==11){
		mes="Dezembro"
	}
	
	return mes;
}
function retornaDescricaoMes(mesAtual){
	//let mesAtual = dayjs().month();
	
	if(mesAtual==1){
		mes="Janeiro"
	}
	if(mesAtual==2){
		mes="Fevereiro"
	}
	if(mesAtual==3){
		mes="Março"
	}
	if(mesAtual==4){
		mes="Abril"
	}
	if(mesAtual==5){
		mes="Maio"
	}
	if(mesAtual==6){
		mes="Junho"
	}
	if(mesAtual==7){
		mes="Julho"
	}
	if(mesAtual==8){
		mes="Agosto"
	}
	if(mesAtual==9){
		mes="Setembro"
	}
	if(mesAtual==10){
		mes="Outubro"
	}
	if(mesAtual==11){
		mes="Novembro"
	}
	if(mesAtual==12){
		mes="Dezembro"
	}
	
	return mes;
}
function retornaNumeroMes(){
	let mesAtual = dayjs().month();	
	
	return mesAtual + 1;
}


function FormataStringData(data) {
			  var dia  = data.split("/")[0];
			  var mes  = data.split("/")[1];
			  var ano  = data.split("/")[2];

			  return ano + '-' + ("0"+mes).slice(-2) + '-' + ("0"+dia).slice(-2);
			  // Utilizo o .slice(-2) para garantir o formato com 2 digitos.
			}

module.exports = router;
