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
    from: "carbonmotorsluxury@gmail.com",
    to: destinatario,
    subject: "Verificação de Cadastro - Carbon",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #334155;">
        <div style="background: linear-gradient(135deg, #0284c7, #2563eb); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Carbon Motors</h1>
          <p style="color: #e0e7ff; margin: 5px 0 0 0; font-size: 16px;">Venda de Carros de Luxo</p>
        </div>
        <div style="padding: 40px 30px; background-color: #0e0b25;">
          <h2 style="color: #f8fafc; margin-top: 0; font-size: 22px;">Olá!</h2>
          <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6;">Obrigado por se cadastrar na Carbon Motors. Para continuar, por favor, confirme seu endereço de e-mail usando o código abaixo:</p>
          
          <div style="background-color: #1e293b; border: 1px dashed #475569; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
            <h1 style="color: #38bdf8; margin: 0; font-size: 36px; letter-spacing: 5px;">${codigo}</h1>
          </div>
          
          <p style="color: #cbd5e1; font-size: 14px; margin-bottom: 0;">Se você não solicitou este código, por favor, ignore este e-mail.</p>
        </div>
        <div style="background-color: #0B0E14; padding: 20px; text-align: center; border-top: 1px solid #1e293b;">
          <p style="color: #64748b; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} Carbon Motors. Todos os direitos reservados.</p>
        </div>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("[DIAG] enviarEmailVerificacao resultado:", JSON.stringify({
    to: destinatario,
    accepted: info.accepted,
    rejected: info.rejected,
    response: info.response,
    messageId: info.messageId,
  }));
}

async function enviarEmailResetSenha(destinatario, link) {
  const mailOptions = {
    from: "carbonmotorsluxury@gmail.com",
    to: destinatario,
    subject: "Redefinição de Senha - Carbon",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #334155;">
        <div style="background: linear-gradient(135deg, #0284c7, #2563eb); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Carbon Motors</h1>
          <p style="color: #e0e7ff; margin: 5px 0 0 0; font-size: 16px;">Venda de Carros de Luxo</p>
        </div>
        <div style="padding: 40px 30px; background-color: #0e0b25;">
          <h2 style="color: #f8fafc; margin-top: 0; font-size: 22px;">Olá!</h2>
          <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6;">Recebemos uma solicitação para redefinir a senha da sua conta na Carbon Motors. Se foi você, clique no botão abaixo para criar uma nova senha:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${link}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Redefinir Minha Senha</a>
          </div>
          
          <p style="color: #cbd5e1; font-size: 14px; margin-bottom: 0;">Se o botão não funcionar, você também pode copiar e colar o seguinte link no seu navegador:</p>
          <p style="color: #94a3b8; font-size: 12px; word-break: break-all;">${link}</p>
          
          <p style="color: #cbd5e1; font-size: 14px; margin-bottom: 0; margin-top: 20px;">Se você não solicitou a redefinição de senha, por favor, ignore este e-mail. Sua senha permanecerá a mesma.</p>
        </div>
        <div style="background-color: #0B0E14; padding: 20px; text-align: center; border-top: 1px solid #1e293b;">
          <p style="color: #64748b; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} Carbon Motors. Todos os direitos reservados.</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = {
  enviarEmailVerificacao,
  enviarEmailResetSenha
};
