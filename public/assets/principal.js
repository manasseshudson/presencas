
$(document).ready(function () {

	

	$('#valor').mask('000000,00', {reverse: true});
	$('#valor_multa').mask('000000,00', {reverse: true});
	$('#valor_total').mask('000000,00', {reverse: true});
	$('#valor_juros').mask('000000,00', {reverse: true});

	$("#data_pagto").mask("00/00/0000");
	$("#vencimento").mask("00/00/0000");

	$("#data_atual").mask("00/00/0000");
	$("#data_vencimento").mask("00/00/0000");
	var getData = dataAtual();			
	document.getElementById("data_atual").value = getData;
	function dataAtual(){
		var data = new Date();
		var dia = String(data.getDate()).padStart(2, '0');
		var mes = String(data.getMonth() + 1).padStart(2, '0');
		var ano = data.getFullYear();
		dataAtual = dia + '/' + mes + '/' + ano;			   
		return dataAtual;
	}


	$("#valor").on("focusout", function() {
		
		
		let valor = $("#valor").val();	
		if(valor!=""){
			valor = valor.replace(",",".");
			valor = parseFloat(valor);
			var f = valor.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
			document.getElementById("valorTotalCalculado").innerHTML = f;
			document.getElementById("vlrTotalCalculado").value=f;
		}
	})



	$("#valor_multa").on("focusout", function() {
		let valor = $("#valor").val();	
		let valor_multa = $("#valor_multa").val();	
		
			
		if(valor!="" && valor_multa!=""){
			
			valor = valor.replace(",",".");
			valor_multa = valor_multa.replace(",",".")
			
			valor_calculado = parseFloat(valor) + parseFloat(valor_multa) ;	
			var atual = valor_calculado;
			
			//console.log(atual)
			
			var f = atual.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
			//sem R$
			//var f2 = atual.toLocaleString('pt-br', {minimumFractionDigits: 2});
			document.getElementById("valorTotalCalculado").innerHTML = f;
			document.getElementById("vlrTotalCalculado").value=f;
			//console.log('valor total calculado'+f);
			
		}
		/*if(valor!="" && valor_multa==""){
			
			var atual = valor;
			var f = atual.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
			//sem R$
			//var f2 = atual.toLocaleString('pt-br', {minimumFractionDigits: 2});
			document.getElementById("valorTotalCalculado").innerHTML = f;
			document.getElementById("vlrTotalCalculado").value=f;
			//console.log('valor total calculado'+f);
			
			
		}*/
	})

	$("#valor_juros").on("focusout", function() {
		let valor = $("#valor").val();					
		let valor_multa = $("#valor_multa").val();
		let valor_juros = $("#valor_juros").val();
	
		valor = valor.replace(",",".");
		valor_multa = valor_multa.replace(",",".");
		valor_juros = valor_juros.replace(",",".");
	
		if(valor!="" && valor_multa!=""){
			valor = parseFloat(valor);
			valor_multa = parseFloat(valor_multa);
			valor_juros = parseFloat(valor_juros);
			
			let valor_calculado = valor + valor_juros + valor_multa;	
			
			var atual = valor_calculado;
			var f = atual.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
			//sem R$
			var f2 = atual.toLocaleString('pt-br', {minimumFractionDigits: 2});
			document.getElementById("valorTotalCalculado").innerHTML = f;
			document.getElementById("vlrTotalCalculado").value=f;
			//console.log('valor total calculado'+f2);
		} 
		
		if(valor!="" && valor_multa==""){
			valor = parseFloat(valor);
			valor_multa = parseFloat(valor_multa);
			valor_juros = parseFloat(valor_juros);
			let valor_calculado = parseFloat(valor) + parseFloat(valor_juros);	
			var atual = valor_calculado;
			var f = atual.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
			//sem R$
			var f2 = atual.toLocaleString('pt-br', {minimumFractionDigits: 2});
			document.getElementById("valorTotalCalculado").innerHTML = f;
			document.getElementById("vlrTotalCalculado").value=f;
			//console.log('valor total calculado'+f2);
		}
		
		
	})
	
	$("#salvarContasaPagar").click(function(){

		const checkbox = document.getElementById("pago");
		const isChecked = checkbox.checked;
		let _status = "";

		if(isChecked==true){
			_status='Pago';
		}
		
		var uid = $("#uid_usuario").val();
		var id_empresa = $("#id_empresa").val();
		var data_emissao = $("#data_atual").val();
		var descricao = $("#descricao").val();				
		var documento = $("#documento").val();
		var data_vencimento = $("#vencimento").val();
		var data_pagamento = $("#data_pagto").val();
		var valor = $("#valor").val().replace(',','.');					
		var valor_multa = $("#valor_multa").val().replace(',','.');
		var valor_juros = $("#valor_juros").val().replace(',','.');
		var valor_total = $("#vlrTotalCalculado").val().replace(',','.').replace('R$ ','');
		var id_categoria = $("#categoria").val();					
		var id_contas = $("#id_contas").val();					
		var id_fornecedor = $("#id_fornecedor").val();
		var observacao = $("#observacao").val();


		//console.log(valor);
		//console.log(valor_juros);
		//console.log(valor_multa);
		if(valor==""){
			alert("Informe o Valor");
			$("#valor").focus();
			return;
		}
		
		
		if(valor_multa!="" && valor_juros!=""){
			var TotalCalculado = parseFloat(valor) + parseFloat(valor_multa) + parseFloat(valor_juros);
		}else if (valor_multa!="" && valor_juros==""){
			var TotalCalculado = parseFloat(valor)+ parseFloat(valor_multa);
		}else if (valor_multa=="" && valor_juros!=""){
			var TotalCalculado = parseFloat(valor)+ parseFloat(valor_juros);
		}
		if(valor_multa=="" && valor_juros==""){
			var TotalCalculado = parseFloat(valor);
		}
		
		if(id_categoria=="0" || id_categoria==""){
			alert("Informe a Categoria");
			return;
		}
		
		if(id_contas=="0" || id_contas==""){
			alert("Informe a Conta");
			return;
		}
		if(id_fornecedor=="0" || id_fornecedor==""){
			alert("Informe a Fornecedor");
			return;
		}
		if(_status=="Pago" && data_pagamento==""){
			alert("Informe a Data de Pagto");				
			$("#data_pagto").focus();
			return;
		}

		if(data_pagamento!=""){
			if(validaData(data_pagamento)==false){
				alert("Informe a data corretamente dd/mm/YYYY");
				return ;				
			}
		}
		if(data_vencimento!=""){
			if(validaData(data_vencimento)==false){
				alert("Informe a data corretamente dd/mm/YYYY");
				return ;				
			}
		}

		console.log('uid_user '+uid)
		console.log('id emprsa '+id_empresa)
		console.log('data emissao '+data_emissao)
		console.log('descricao '+descricao)
		console.log('documento '+documento)
		
		console.log('vencimento '+data_vencimento)
		console.log('pagto '+data_pagamento)
		console.log('valor '+valor)
		console.log('multa '+valor_multa)
		console.log('juros '+valor_juros)
		console.log('total '+valor_total)
		console.log('conta '+id_contas)
		console.log('fornecedor '+id_fornecedor)
		console.log('obs '+observacao)
		console.log('status '+_status)

		
		$.post('/adm/ContasPagar', {
			uid_usuario: uid,
			id_empresa: id_empresa,
			lancamento: data_emissao,
			descricao: descricao,
			documento: documento,
			data_vencimento_formatada:data_vencimento,
			vencimento: data_vencimento,
			data_pagto: data_pagamento,
			
			valor: valor,
			valor_multa: valor_multa,
			valor_juros: valor_juros,
			valor_total: TotalCalculado,
			
			id_categoria:id_categoria,
			id_contas: id_contas,
			id_fornecedor: id_fornecedor,
			observacao: observacao,
			status: _status

		}, function(resposta) {
			$("#descricao").val("");				
			$("#documento").val("");
			$("#vencimento").val("");
			$("#data_pagto").val("");
			$("#valor").val("");					
			$("#valor_multa").val("");
			$("#valor_juros").val("");
			$("#valor_total").val("");
			$("#id_contas").val("");					
			$("#id_fornecedor").val("");
			$("#observacao").val("");
			
			alert("Contas a pagar cadastrado com sucesso.");				
			
			setTimeout(() => {
			  location.reload(); 
			}, "1000");
			
		});

		function validaData (valor) {
			// Verifica se a entrada é uma string
			if (typeof valor !== 'string') {
				return false
			}

			// Verifica formado da data
			if (!/^\d{2}\/\d{2}\/\d{4}$/.test(valor)) {
				return false
			}

			// Divide a data para o objeto "data"
			const partesData = valor.split('/')
			const data = { 
				dia: partesData[0], 
				mes: partesData[1], 
				ano: partesData[2] 
			}
			
			// Converte strings em número
			const dia = parseInt(data.dia)
			const mes = parseInt(data.mes)
			const ano = parseInt(data.ano)
			
			// Dias de cada mês, incluindo ajuste para ano bissexto
			const diasNoMes = [ 0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ]

			// Atualiza os dias do mês de fevereiro para ano bisexto
			if (ano % 400 === 0 || ano % 4 === 0 && ano % 100 !== 0) {
				diasNoMes[2] = 29
			}
			
			// Regras de validação:
			// Mês deve estar entre 1 e 12, e o dia deve ser maior que zero
			if (mes < 1 || mes > 12 || dia < 1) {
				return false
			}
			// Valida número de dias do mês
			else if (dia > diasNoMes[mes]) {
				return false
			}
			
			// Passou nas validações
			return true
		}
	})
})