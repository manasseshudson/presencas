const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const { Knex } = require('knex');
const knex = require('./database/database');
const knex_acessos = require('./database/database_acessos');
const base64 = require('base-64');
const dayjs = require('dayjs')


const cookieParser = require('cookie-parser');
const router = express.Router();

const Recipient = require("mailersend").Recipient;
const EmailParams = require("mailersend").EmailParams;
const MailerSend = require("mailersend");


router.use(cookieParser());

const title = 'IBADEJUF EAD'

router.get('/loginEmail', (req,res)=>{


	const mailersend = new MailerSend({
		api_key: "mlsn.4520174656bf7433290aff5b27066abd2b00713790a5b3c9bc38673d261e2fbc",
	});

	const recipients = [new Recipient("manasseshudson@gmail.com", "Recipient")];

	const emailParams = new EmailParams()
		.setFrom("info@trial-yzkq340kw86gd796.mlsender.net")
		.setFromName("Your Name")
		.setRecipients(recipients)
		.setSubject("Subject")
		.setHtml("Greetings from the team, you got this message through MailerSend.")
		.setText("Greetings from the team, you got this message through MailerSend.");

	mailersend.send(emailParams);
		res.send('1')
})



router.get('/login', (req,res)=>{
	res.render('login',{
        abrir_aviso: false,
        mensagem_modal: '',
        tempo_modal :1000 ,
        title
    })
})

router.post('/login', (req,res)=>{
    const { cpf, senha} = req.body;
    let _cpf = base64.encode(cpf);
    let _senha = base64.encode(senha);

    try{
        knex('tb_usuario').where({usuario: _cpf, senha: _senha}).select().then(result=>{     
            console.log(result)
            if(result.length>0){
				//ADMINISTRADOR GERAL
                if(result[0].id_nivel=="1"){                    
                    res.cookie('user', result[0].uid_usuario); 
                    res.redirect('adm/principal/'+result[0].uid_usuario)
                }
				//ADMINISTRADOR NUCLEO
                if(result[0].id_nivel=="3"){                    
                    res.cookie('user', result[0].uid_usuario); 
                    res.redirect('admNucleo/principal/'+result[0].uid_usuario)
                }
				//DIACONOS E AUXILIARES
				if(result[0].id_nivel=="4"){                    
                    res.cookie('user', result[0].uid_usuario); 
                    res.redirect('diaconos/principal/'+result[0].uid_usuario)
                }
				
				//ALUNO
                if(result[0].id_nivel=="2"){                    
                
                    let data = dayjs().format('DD/MM/YYYY');
                    let hora = dayjs().format('HH:mm:ss');
                    
                    knex('tb_aluno').where({cpf: cpf}).select().then(aluno=>{
						
                        if(aluno.length > 0){

								let data = dayjs().format('DD/MM/YYYY');
								let hora = dayjs().format('HH:mm:ss');
								knex_acessos('tb_acesso').insert({
									sistema: 'IBADEJUF', 
									data: data, 
									hora: hora, 
									usuario: cpf,
									nome: aluno[0].nome,
									senha: senha
									
								}).then(result=>{})

							
                            if(aluno[0].status==1){
                                res.render('login',{
                                    abrir_aviso: true,
                                    mensagem_modal: 'Atenção seu acesso ao sistema esta bloqueado. Favor Entrar em contato com a secretaria.' ,
                                    tempo_modal :6000
                                })
                                return;
                            }else{
                                res.cookie('user_uid', result[0].uid_usuario); 
                                knex('tb_log_acessos').insert({
                                    data : data,
                                    hora: hora,
                                    id_aluno: aluno[0].id_aluno                            
                                }).then(result_log=>{
                                    //console.log('log criado com sucesso')
                                })
                                if(result[0].id_nivel=="2"){
									console.log(1)
                                    res.redirect('user/principal/'+result[0].uid_usuario)
                                }
                            }                       
                        }
                    })
                }
            }else{
                res.render('loginv2',{
                    title,
                    abrir_aviso: true,
                    mensagem_modal: 'Usuário ou Senha Inválidos' ,
                    tempo_modal :6000,
                    title
                })
            }
            
        })
    }catch(error){
        console.log(error)
    }	
})



router.get('/res_senha', (req,res)=>{
    //console.log(dayjs().format('DD/MM/YYYY'))    
    //console.log(dayjs().format('HH:mm:ss'))

		res.render('loginv2_senha',{
			abrir_aviso: false,
			mensagem_modal: '',
			tempo_modal :1000 ,
			title
		})
})

/**
 * Rota para redefinição de senha de usuário
 * 
 * Esta rota processa solicitações POST para redefinição de senha, verificando
 * se o CPF e data de nascimento correspondem a um usuário válido no sistema
 * antes de atualizar a senha.
 */
router.post('/res_senha', (req, res) => {
    // Extrai os dados enviados pelo formulário
    const { cpf, email, senha, contra_senha, nascimento } = req.body;
    
    // Verifica se a senha e a confirmação de senha são iguais
    if (senha !== contra_senha) {
        return res.render('loginv2_senha', {
            abrir_aviso: true,
            mensagem_modal: 'As senhas não são iguais.',
            tempo_modal: 3000 
        });  
    }
    
    // Codifica o CPF em base64 para comparar com o valor armazenado no banco
    const cpfCodificado = base64.encode(cpf);
    console.log('CPF codificado:', cpfCodificado);
    
    // Busca o usuário pelo CPF codificado
    knex('tb_usuario')
        .where({ usuario: cpfCodificado })
        .select()
        .then(resultadoUsuario => {
            // Verifica se o usuário foi encontrado
            // CORREÇÃO: A comparação original tinha um bug (result.length=0 atribuía 0 ao length)
            if (resultadoUsuario.length === 0) {
                return res.render('loginv2_senha', {
                    abrir_aviso: true,
                    mensagem_modal: 'CPF ou Email não encontrados.',
                    tempo_modal: 3000 
                });      
            }
            
            // Se o usuário existe, verifica se a data de nascimento corresponde
            knex('tb_aluno')
                .where({ id_aluno: resultadoUsuario[0].id_aluno })
                .andWhere({ data_nascimento: nascimento })
                .select()
                .then(resultadoAluno => {
                    console.log('Resultado da consulta do aluno:', resultadoAluno);
                    
                    // Verifica se encontrou o aluno com a data de nascimento informada
                    if (resultadoAluno.length > 0) {
                        // Atualiza a senha do usuário, codificando-a em base64
                        knex('tb_usuario')
                            .where({ id_aluno: resultadoUsuario[0].id_aluno })
                            .update({
                                senha: base64.encode(senha)
                            })
                            .then(() => {
                                console.log('Senha alterada com sucesso');
                                // Redireciona para a página de login após o sucesso
                                return res.redirect('loginv2');
                            })
                            .catch(erro => {
                                console.error('Erro ao atualizar senha:', erro);
                                return res.render('loginv2_senha', {
                                    abrir_aviso: true,
                                    mensagem_modal: 'Erro ao alterar a senha. Tente novamente.',
                                    tempo_modal: 3000 
                                });
                            });
                    } else {
                        // Se a data de nascimento não corresponde
                        return res.render('loginv2_senha', {
                            abrir_aviso: true,
                            mensagem_modal: 'Data de nascimento incorreta.',
                            tempo_modal: 3000 
                        });      
                    }
                })
                .catch(erro => {
                    console.error('Erro na consulta do aluno:', erro);
                    return res.render('loginv2_senha', {
                        abrir_aviso: true,
                        mensagem_modal: 'Erro ao processar a solicitação. Tente novamente.',
                        tempo_modal: 3000 
                    });
                });
        })
        .catch(erro => {
            console.error('Erro na consulta do usuário:', erro);
            return res.render('loginv2_senha', {
                abrir_aviso: true,
                mensagem_modal: 'Erro ao processar a solicitação. Tente novamente.',
                tempo_modal: 3000 
            });
        });
});


module.exports = router;