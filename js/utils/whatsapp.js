function WhatsAppFraniel() {
	const numero = "5511992091856";
	const mensagem = encodeURIComponent("Olá! Vim através do seu site e gostaria de solicitar um orçamento/proposta. Podemos conversar?");
	const link = `https://wa.me/${numero}?text=${mensagem}`;
	window.open(link, "_blank");
}
