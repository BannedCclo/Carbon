const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

async function enviarEmailVerificacao(destinatario, codigo) {
  const mailOptions = {
    from: "Carbon Motors <carbonmotorsluxury@gmail.com>",
    to: destinatario,
    subject: "Confirme seu cadastro na Carbon Motors",
    text: `Olá!\n\nObrigado por se cadastrar na Carbon Motors. Use o código abaixo para confirmar seu e-mail:\n\n${codigo}\n\nSe você não solicitou este cadastro, ignore esta mensagem.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1f2937;">
        <p style="font-size: 16px; margin-top: 0;">Olá!</p>
        <p style="font-size: 15px; line-height: 1.6;">Obrigado por se cadastrar na Carbon Motors. Use o código abaixo para confirmar seu e-mail:</p>
        <p style="font-size: 24px; font-weight: 600; letter-spacing: 3px; margin: 24px 0;">${codigo}</p>
        <p style="font-size: 13px; color: #6b7280;">Se você não solicitou este cadastro, ignore esta mensagem.</p>
        <p style="font-size: 12px; color: #9ca3af; margin-top: 32px;">Carbon Motors</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

async function enviarEmailResetSenha(destinatario, link) {
  const mailOptions = {
    from: "Carbon Motors <carbonmotorsluxury@gmail.com>",
    to: destinatario,
    subject: "Redefinição de senha - Carbon Motors",
    text: `Olá!\n\nRecebemos uma solicitação para redefinir a senha da sua conta na Carbon Motors. Se foi você, acesse o link abaixo para criar uma nova senha:\n\n${link}\n\nSe você não solicitou a redefinição de senha, ignore esta mensagem.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1f2937;">
        <p style="font-size: 16px; margin-top: 0;">Olá!</p>
        <p style="font-size: 15px; line-height: 1.6;">Recebemos uma solicitação para redefinir a senha da sua conta na Carbon Motors. Se foi você, acesse o link abaixo para criar uma nova senha:</p>
        <p style="margin: 24px 0;"><a href="${link}" style="color: #2563eb;">${link}</a></p>
        <p style="font-size: 13px; color: #6b7280;">Se você não solicitou a redefinição de senha, ignore esta mensagem.</p>
        <p style="font-size: 12px; color: #9ca3af; margin-top: 32px;">Carbon Motors</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = {
  enviarEmailVerificacao,
  enviarEmailResetSenha
};
