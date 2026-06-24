import nodemailer from 'nodemailer'
import type { EmailSender } from '../domain/ports'

type SmtpConfig = {
  host: string
  port: number
  user: string
  password: string
  from: string
}

export class NodemailerEmailSender implements EmailSender {
  private transporter!: nodemailer.Transporter
  private from: string
  private ready: Promise<void>

  constructor(config: SmtpConfig) {
    this.from = config.from
    this.ready = this.init(config)
  }

  private async init(config: SmtpConfig): Promise<void> {
    if (config.user && config.password) {
      this.transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: false,
        auth: { user: config.user, pass: config.password },
      })
      console.log(`[email] SMTP configured: ${config.host}:${config.port}`)

      return
    }

    const testAccount = await nodemailer.createTestAccount()

    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    })

    this.from = testAccount.user
    console.log('[email] Ethereal (dev mode) — emails are NOT actually delivered')
    console.log(`[email] Inbox: https://ethereal.email/login`)
    console.log(`[email] User: ${testAccount.user}`)
    console.log(`[email] Pass: ${testAccount.pass}`)
  }

  async sendConfirmationCode(to: string, verificationCode: string): Promise<void> {
    await this.ready

    const html = `
      <h2>Confirmation Code</h2>
      <p>Your confirmation code is: <strong>${verificationCode}</strong></p>
      <p>This code expires in 30 minutes.</p>
    `

    const info = await this.transporter.sendMail({
      from: this.from,
      to,
      subject: 'Confirmation Code',
      html,
    })

    const previewUrl = nodemailer.getTestMessageUrl(info)
    if (previewUrl) console.log(`[email] Preview: ${previewUrl}`)
  }

  async sendReviewConfirmation(to: string, schoolName: string): Promise<void> {
    await this.ready

    const html = `
      <h2>Review Submitted Successfully</h2>
      <p>Your review for <strong>${schoolName}</strong> has been recorded.</p>
    `

    const info = await this.transporter.sendMail({
      from: this.from,
      to,
      subject: 'Review Submitted Successfully',
      html,
    })

    const previewUrl = nodemailer.getTestMessageUrl(info)
    if (previewUrl) console.log(`[email] Preview: ${previewUrl}`)
  }

  async sendUpdateReport(to: string, subject: string, html: string): Promise<void> {
    await this.ready

    const info = await this.transporter.sendMail({
      from: this.from,
      to,
      subject,
      html,
    })

    const previewUrl = nodemailer.getTestMessageUrl(info)
    if (previewUrl) console.log(`[email] Preview: ${previewUrl}`)
  }
}
