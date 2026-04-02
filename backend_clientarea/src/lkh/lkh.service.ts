import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export interface LkhQueryParams {
  email?: string;
  start_date?: string; // YYYY-MM-DD, filter createdAt >= 00:00:00
  end_date?: string;   // YYYY-MM-DD, filter createdAt <= 23:59:59
}

export interface LkhDataItem {
  id: number;
  userid: number;
  jenis: string;
  no_invoice: string;
  description: string;
  status: string;
  rating: string;
  source_database: string;
  email: string;
  name: string; // nama agent dari tabel agent (bukan dari backend_messages)
  created_at_log: string;
  waktu: string;
  keterangan: string;
}

function formatCreatedAtLog(d: Date | string | null | undefined): string {
  if (d == null) return '';
  const date = typeof d === 'string' ? new Date(d) : d;
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${y}-${m}-${day} ${h}:${min}:${s}`;
}

function formatWaktu(d: Date | string | null | undefined): string {
  if (d == null) return '';
  const date = typeof d === 'string' ? new Date(d) : d;
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${day}-${m}-${y} ${h}:${min}:${s}`;
}

function chatStatusToLabel(chatStatus: string | null | undefined): string {
  if (chatStatus == null) return '';
  const s = String(chatStatus).toLowerCase();
  const map: Record<string, string> = {
    open: 'Open',
    closed: 'Closed',
  };
  return map[s] ?? String(chatStatus);
}

interface RawRow {
  id: number;
  message_id?: string;
  chat_session_id?: string | null;
  body?: string | null;
  chat_status?: string;
  chatstatus?: string;
  rating?: number | null;
  email?: string | null;
  agent_name?: string | null;
  agentname?: string | null;
  createdAt?: Date | string;
  created_at?: Date | string;
  createdat?: Date | string;
}

function mapRawToLkhItem(row: RawRow): LkhDataItem {
  const dateVal = row.createdAt ?? row.created_at ?? row.createdat ?? null;
  const chatStatus = row.chat_status ?? row.chatstatus ?? '';
  const ratingVal = row.rating;
  const name = (row.agent_name ?? row.agentname) && String(row.agent_name ?? row.agentname).trim() ? String(row.agent_name ?? row.agentname).trim() : '';
  return {
    id: row.id,
    userid: 0,
    jenis: 'Chatvolution',
    no_invoice: (row.chat_session_id && String(row.chat_session_id).trim()) ? String(row.chat_session_id).trim() : String(row.id),
    description: (row.body ?? '').trim(),
    status: chatStatusToLabel(chatStatus),
    rating: ratingVal != null ? String(ratingVal) : '',
    source_database: 'chatvolution',
    email: row.email && String(row.email).trim() ? String(row.email).trim() : '',
    name,
    created_at_log: formatCreatedAtLog(dateVal),
    waktu: formatWaktu(dateVal),
    keterangan: '',
  };
}

@Injectable()
export class LkhService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  /**
   * Ambil data LKH dari tabel backend_messages.
   * Dikelompokkan per chat_session_id (satu baris per session), hanya yang punya agent_id.
   * no_invoice memakai chat_session_id.
   */
  async getLkh(query: LkhQueryParams): Promise<{
    status: string;
    data: LkhDataItem[];
    total: number;
  }> {
    const conditions: string[] = [
      'm.agent_id IS NOT NULL',
      "TRIM(COALESCE(m.agent_id, '')) != ''",
      'm.name = a.name', // hanya pesan yang name-nya sama dengan nama di tabel agent (mis. "Aldi Novriadi"), yang "AI" tidak ikut
      'm.chat_session_id IS NOT NULL',
      "TRIM(COALESCE(m.chat_session_id, '')) != ''",
    ];
    const countParams: unknown[] = [];
    const dataParams: unknown[] = [];

    if (query.start_date) {
      conditions.push('m.createdAt >= ?');
      const start = new Date(query.start_date);
      start.setHours(0, 0, 0, 0);
      countParams.push(start);
      dataParams.push(start);
    }
    if (query.end_date) {
      conditions.push('m.createdAt <= ?');
      const end = new Date(query.end_date);
      end.setHours(23, 59, 59, 999);
      countParams.push(end);
      dataParams.push(end);
    }
    if (query.email && String(query.email).trim()) {
      conditions.push('a.email = ?');
      countParams.push(query.email.trim());
      dataParams.push(query.email.trim());
    }

    const whereSql = conditions.join(' AND ');
    // Subquery pakai m2, a2 agar sama kondisinya
    const whereSqlSub = whereSql.replace(/\bm\./g, 'm2.').replace(/\ba\./g, 'a2.');
    const joinClause = 'INNER JOIN agent a ON a.id = m.agent_id';
    const joinClauseSub = 'INNER JOIN agent a2 ON a2.id = m2.agent_id';
    // Total = jumlah session unik (bukan jumlah message)
    const countSql = `SELECT COUNT(DISTINCT m.chat_session_id) as total FROM backend_messages m ${joinClause} WHERE ${whereSql}`;
    // Satu baris per chat_session_id: body = gabungan semua body dalam session (dipisah ;), kolom lain dari message terakhir
    const dataSql = `SELECT m.id, m.message_id, m.chat_session_id, sub.bodies AS body, m.chat_status, m.rating, m.createdAt, a.email, a.name AS agent_name
FROM backend_messages m
${joinClause}
INNER JOIN (
  SELECT m2.chat_session_id, MAX(m2.id) as max_id,
    GROUP_CONCAT(m2.body ORDER BY m2.id SEPARATOR ';') AS bodies
  FROM backend_messages m2
  ${joinClauseSub}
  WHERE ${whereSqlSub}
  GROUP BY m2.chat_session_id
) sub ON m.chat_session_id = sub.chat_session_id AND m.id = sub.max_id
WHERE ${whereSql}
ORDER BY m.createdAt DESC`;

    const [countResult] = await this.dataSource.query(countSql, countParams);
    const total = Number(countResult?.total ?? 0);

    // dataSql punya 2× WHERE (subquery + outer) → butuh param dua kali
    const rows: RawRow[] = await this.dataSource.query(dataSql, [...dataParams, ...dataParams]);
    const data = rows.map(mapRawToLkhItem);

    return {
      status: 'success',
      data,
      total,
    };
  }
}
