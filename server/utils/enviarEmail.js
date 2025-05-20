const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "carbonmotorsluxury@gmail.com",
    pass: "udkp xozv srhu muxs ",
  },
});

async function enviarEmailVerificacao(destinatario, codigo) {
  const mailOptions = {
    from: "carbonmotorsluxury@gmail.com",
    to: destinatario,
    subject: "Verificação de Cadastro - Carbon",
    html: `
      <h2>Olá!</h2>
      <p>Seu código de verificação é:</p>
      <h1>${codigo}</h1>
      <p>Use este código para confirmar seu cadastro.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = enviarEmailVerificacao;
