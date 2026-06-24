import { notFound } from '../../../shared/errors/AppError'
import type { AppliedChange, SchoolSnapshot, UpdateKind } from './models'
import type { NotificationEmailSender, NotificationRepository } from './ports'

const fmtNumber = (value: number | null): string =>
  value === null ? '—' : value.toLocaleString('pt-BR')

const fmtCurrency = (value: number | null): string =>
  value === null
    ? '—'
    : `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const reportRow = (label: string, value: string, year: number | null): string => `
  <tr>
    <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#80685D;">${label}${year !== null ? ` (${String(year)})` : ''}</td>
    <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#373737;font-weight:600;text-align:right;">${value}</td>
  </tr>`

const renderReportHtml = (snapshot: SchoolSnapshot, change: AppliedChange): string => `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">
    <div style="background:#FF7A3A;padding:18px 22px;">
      <div style="color:#fff;font-size:13px;letter-spacing:1px;">escolas.digital</div>
      <div style="color:#fff;font-size:20px;font-weight:bold;margin-top:4px;">Atualização de dados</div>
    </div>
    <div style="padding:22px;">
      <div style="font-size:18px;font-weight:bold;color:#373737;">${snapshot.name}</div>
      <div style="font-size:13px;color:#80685D;margin-top:2px;">INEP ${snapshot.inep} · ${snapshot.city}/${snapshot.uf}</div>

      <div style="margin-top:18px;background:#FBF2EE;border-left:4px solid #FF7A3A;padding:12px 16px;border-radius:6px;">
        <div style="color:#80685D;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">${change.field}</div>
        <div style="color:#373737;font-size:15px;margin-top:4px;">${change.detail}</div>
      </div>

      <div style="margin-top:20px;color:#80685D;font-size:14px;font-weight:bold;">Resumo atual da escola</div>
      <table style="width:100%;border-collapse:collapse;margin-top:8px;font-size:14px;">
        ${reportRow('Matrículas (Censo)', fmtNumber(snapshot.totalEnrollment), snapshot.censusYear)}
        ${reportRow('Média ENEM', fmtNumber(snapshot.enemAverage), snapshot.enemYear)}
        ${reportRow('IDEB Anos Iniciais', fmtNumber(snapshot.idebEarly), snapshot.idebYear)}
        ${reportRow('Repasse PDDE', fmtCurrency(snapshot.pddeTotal), snapshot.pddeYear)}
      </table>

      <div style="margin-top:22px;font-size:12px;color:#AD7A62;">
        Você recebe este aviso porque assinou as atualizações desta escola no escolas.digital.
      </div>
    </div>
  </div>`

export class NotificationService {
  constructor(
    private readonly repo: NotificationRepository,
    private readonly email: NotificationEmailSender,
  ) {}

  async simulateUpdate(
    schoolId: number,
    kind: UpdateKind,
  ): Promise<{ change: AppliedChange; notified: string[] }> {
    const schoolExists = await this.repo.schoolExists(schoolId)
    if (!schoolExists) throw notFound('Escola não encontrada!')

    const change = await this.repo.applyChange(schoolId, kind)

    const snapshot = await this.repo.getSnapshot(schoolId)
    if (!snapshot) throw notFound('Escola não encontrada!')

    const recipients = await this.repo.findSubscribers(schoolId, kind)

    const subject = `Atualização em ${snapshot.name}`
    const html = renderReportHtml(snapshot, change)

    for (const to of recipients) await this.email.sendUpdateReport(to, subject, html)

    return { change, notified: recipients }
  }
}
