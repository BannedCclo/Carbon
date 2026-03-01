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

  await transporter.sendMail(mailOptions);
}

module.exports = enviarEmailVerificacao;
