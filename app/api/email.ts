// /pages/api/enviar-email.js
import nodemailer from 'nodemailer';

export default async function handler(
  req: { method: string; body: { imp: any; dataFinalizacao: any } },
  res: {
    status: (arg0: number) => {
      (): any;
      new (): any;
      json: { (arg0: { error?: string; message?: string }): any; new (): any };
    };
  },
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imp, dataFinalizacao } = req.body;

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user: 'michael@grupoativa.net', pass: '*At172482' },
  });

  try {
    await transporter.sendMail({
      from: '"Sistema" <michael@grupoativa.net>',
      to: 'michael@grupoativa.net',
      subject: `Processo ${imp} Finalizado`,
      text: `O processo ${imp} foi finalizado em ${dataFinalizacao}.`,
    });

    return res.status(200).json({ message: 'Email enviado com sucesso' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao enviar email' });
  }
}
