const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "carbonmotorsluxury@gmail.com",
    pass: "udkp xozv srhu muxs ", // Ideally this should be in .env but keeping it identical to existing utils
  },
});

router.post('/purchase-interest', async (req, res) => {
  const { nome, email, telefone, mensagem, carroMarca, carroModelo, carroId } = req.body;

  try {
    const mailOptions = {
        from: "carbonmotorsluxury@gmail.com",
        to: "carbonmotorsluxury@gmail.com", // Sending to themselves 
        subject: `Novo Interesse de Compra - ${carroMarca} ${carroModelo}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; color: #334155; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
            <div style="background: linear-gradient(135deg, #0f172a, #1e293b); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">Novo Lead Recebido!</h1>
              <p style="color: #94a3b8; margin: 5px 0 0 0; font-size: 16px;">Venda de Carros de Luxo</p>
            </div>
            <div style="padding: 30px;">
              <p style="font-size: 16px; line-height: 1.6; margin-top: 0;">Um cliente demonstrou interesse no catálogo online.</p>
              
              <div style="background-color: white; border-left: 4px solid #0284c7; padding: 15px 20px; margin: 20px 0; border-radius: 0 8px 8px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <h3 style="margin: 0 0 10px 0; color: #0f172a; font-size: 18px;">Veículo de Interesse</h3>
                <p style="margin: 0; font-size: 16px;"><strong>${carroMarca} ${carroModelo}</strong> <span style="color: #64748b; font-size: 14px;">(ID: ${carroId})</span></p>
              </div>
              
              <h3 style="color: #0f172a; margin: 30px 0 15px 0; font-size: 18px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Dados do Cliente</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 15px; border-bottom: 1px solid #e2e8f0; font-weight: 600; width: 35%;">Nome:</td>
                  <td style="padding: 12px 15px; border-bottom: 1px solid #e2e8f0;">${nome}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 15px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">E-mail:</td>
                  <td style="padding: 12px 15px; border-bottom: 1px solid #e2e8f0;"><a href="mailto:${email}" style="color: #0284c7; text-decoration: none;">${email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 12px 15px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">Telefone:</td>
                  <td style="padding: 12px 15px; border-bottom: 1px solid #e2e8f0;"><a href="https://wa.me/55${telefone.replace(/\D/g, '')}" style="color: #0284c7; text-decoration: none;">${telefone}</a></td>
                </tr>
              </table>

              <h3 style="color: #0f172a; margin: 30px 0 15px 0; font-size: 18px;">Mensagem</h3>
              <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; font-style: italic; color: #475569;">
                "${mensagem || "Nenhuma mensagem adicional enviada."}"
              </div>
            </div>
          </div>
        `,
      };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ mensagem: "Email de interesse enviado com sucesso!" });
  } catch (error) {
    console.error("Erro ao enviar email de interesse:", error);
    res.status(500).json({ erro: "Erro ao enviar e-mail", detalhes: error.message });
  }
});

module.exports = router;
