/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable camelcase */
import {QueryTypes} from "sequelize";
import * as _ from "lodash";
import sequelize from "../../database";

export interface DashboardData {
  counters: any;
  attendants: [];
}

export interface Params {
  days?: number;
  date_from?: string;
  date_to?: string;
}

export default async function DashboardDataService(
  companyId: string | number,
  params: Params
): Promise<DashboardData> {
  /*const query = `
    with
    traking as (
      select
        c.name "companyName",
        u.name "userName",
        u.online "userOnline",
        w.name "whatsappName",
        ct.name "contactName",
        ct.number "contactNumber",
        (tt."finishedAt" is not null) "finished",
        (tt."userId" is null and tt."finishedAt" is null) "pending",
        (tt."startedAt" is not null and tt."finishedAt" is null) "open",
        coalesce((
          (date_part('day', age(coalesce(tt."ratingAt", tt."finishedAt") , tt."startedAt")) * 24 * 60) +
          (date_part('hour', age(coalesce(tt."ratingAt", tt."finishedAt"), tt."startedAt")) * 60) +
          (date_part('minutes', age(coalesce(tt."ratingAt", tt."finishedAt"), tt."startedAt")))
        ), 0) "supportTime",
        coalesce((
          (date_part('day', age(tt."startedAt", tt."queuedAt")) * 24 * 60) +
          (date_part('hour', age(tt."startedAt", tt."queuedAt")) * 60) +
          (date_part('minutes', age(tt."startedAt", tt."queuedAt")))
        ), 0) "waitTime",
        t.status,
        tt.*,
        ct."id" "contactId"
      from "TicketTraking" tt
      left join "Companies" c on c.id = tt."companyId"
      left join "Users" u on u.id = tt."userId"
      left join "Whatsapps" w on w.id = tt."whatsappId"
      left join "Tickets" t on t.id = tt."ticketId"
      left join "Contacts" ct on ct.id = t."contactId"
      -- filterPeriod
    ),
    counters as (
      select
        (select avg("supportTime") from traking where "supportTime" > 0) "avgSupportTime",
        (select avg("waitTime") from traking where "waitTime" > 0) "avgWaitTime",
        (
          select count(distinct "id")
          from "Tickets"
          where status like 'open' and "companyId" = ?
        ) "supportHappening",
        (
          select count(distinct "id")
          from "Tickets"
          where status like 'pending' and "companyId" = ?
        ) "supportPending",
        (select count(id) from traking where finished) "supportFinished",
        (
          select count(leads.id) from (
            select
              ct1.id,
              count(tt1.id) total
            from traking tt1
            left join "Tickets" t1 on t1.id = tt1."ticketId"
            left join "Contacts" ct1 on ct1.id = t1."contactId"
            group by 1
            having count(tt1.id) = 1
          ) leads
        ) "leads"
    ),
    attedants as (
      select
        u.id,
        u.name,
        coalesce(att."avgSupportTime", 0) "avgSupportTime",
        coalesce(att."avgWaitTime", 0) "avgWaitTime",
        att.tickets,
        att.rating,
        att.online,
        att."closeCount",
        att."openCount"
	from "Users" u
      left join (
        select
          u1.id,
          u1."name",
          u1."online",
          avg(t."supportTime") "avgSupportTime",
          avg(t."waitTime") "avgWaitTime",
          count(t."id") tickets,
          coalesce(avg(ur.rate), 0) rating,
		(
          select count(distinct "id")
          from traking
          where "finishedAt" is not null and "companyId" = ? and "userId" = u1.id
        )  AS "closeCount"   , 		(
          select count(distinct "id")
          from traking
          where "startedAt" is not null and "finishedAt" is null and "companyId" = ? and "userId" = u1.id
        )  AS "openCount"
		  from "Users" u1
        left join traking t on t."userId" = u1.id
        left join "UserRatings" ur on ur."userId" = t."userId" and ur."createdAt"::date = t."finishedAt"::date
        group by 1, 2
      ) att on att.id = u.id
      where u."companyId" = ?
      order by att.name
    )
    select
      (select coalesce(jsonb_build_object('counters', c.*)->>'counters', '{}')::jsonb from counters c) counters,
      (select coalesce(json_agg(a.*), '[]')::jsonb from attedants a) attendants;
  `;

  let where = 'where tt."companyId" = ?';
  const replacements: any[] = [companyId];

  if (_.has(params, "days")) {
    where += ` and tt."createdAt" >= (now() - '? days'::interval)`;
    replacements.push(parseInt(`${params.days}`.replace(/\D/g, ""), 10));
  }

  if (_.has(params, "date_from")) {
    where += ` and tt."createdAt" >= ?`;
    replacements.push(`${params.date_from} 00:00:00`);
  }

  if (_.has(params, "date_to")) {
    where += ` and tt."createdAt" <= ?`;
    replacements.push(`${params.date_to} 23:59:59`);
  }

  replacements.push(companyId);
  replacements.push(companyId);
  replacements.push(companyId);
  replacements.push(companyId);
  replacements.push(companyId);

  const finalQuery = query.replace("-- filterPeriod", where);

   */

  const query = ` with traking as (select c.name                   "companyName",
                                          u.name                   "userName",
                                          u.online                 "userOnline",
                                          w.name                   "whatsappName",
                                          ct.name                  "contactName",
                                          ct.number                "contactNumber",
                                          (t."status" = 'closed')  "finished",
                                          (tt."userId" is null and tt."finishedAt" is null and
                                           t."status" = 'pending') "pending",
                                          coalesce(
                                            ((date_part('day', age(tt."finishedAt")) * 24 *
                                              60) + (date_part('hour',
                                                               age(tt."finishedAt", tt."startedAt")) *
                                                     60) + (date_part('minutes',
                                                                      age(tt."finishedAt", tt."startedAt")))),
                                            0)                     "supportTime",
                                          coalesce(((date_part('day', age(tt."queuedAt", tt."startedAt")) * 24 * 60) +
                                                    (date_part('hour', age(tt."queuedAt", tt."startedAt")) * 60) +
                                                    (date_part('minutes', age(tt."queuedAt", tt."startedAt")))),
                                                   0)              "waitTime",
                                          t.status,
                                          tt.*,
                                          ct."id"                  "contactId"
                                   from "TicketTraking" tt
                                          left join "Companies" c on c.id = tt."companyId"
                                          left join "Users" u on u.id = tt."userId"
                                          left join "Whatsapps" w on w.id = tt."whatsappId"
                                          left join "Tickets" t on t.id = tt."ticketId"
                                          left join "Contacts" ct on ct.id = t."contactId" -- filterPeriod ), counters as (   select     (select avg("supportTime") from traking where "supportTime" > 0) "avgSupportTime",     (select avg("waitTime") from traking where "waitTime" > 0) "avgWaitTime",     (       select count(distinct "id")       from "Tickets" t       where status like 'open' and t."companyId" = ?     ) "supportHappening",     (       select count(distinct "id")       from "Tickets" t       where status like 'pending' and t."companyId" = ?     ) "supportPending",     (select count(id) from traking where finished) "supportFinished",     (       select count(leads.id) from (         select           ct1.id,           count(tt1.id) total         from traking tt1         left join "Tickets" t1 on t1.id = tt1."ticketId"         left join "Contacts" ct1 on ct1.id = t1."contactId"         group by 1         having count(tt1.id) = 1       ) leads     ) "leads",     (select count(id) from traking where "status" = 'closed') "tickets",     (select count(id) from traking where "status" = 'nps') "waitRating",     (select count(id) from traking where "status" = 'closed' and "rated" = false) "withoutRating",     (select count(id) from traking where "status" = 'closed' and "rated" = true) "withRating",     (((select count(id) from traking where "rated" = true)* 100) / nullif((select count(id) from traking),0)) "percRating",     (select        (100*count(tt.*))/NULLIF((select count(*) total from traking tt inner join "UserRatings" ur on ur."ticketId" = tt."ticketId" where rated= true),0)       from traking  tt       inner join "UserRatings" ur on ur."ticketId" = tt."ticketId"       where tt.rated = true          and ur."rate" > 8     ) "npsPromotersPerc",     (select            (100*count(tt.*))/NULLIF((select count(*) total from traking tt inner join "UserRatings" ur on ur."ticketId" = tt."ticketId" where rated= true),0)         from traking  tt         inner join "UserRatings" ur on ur."ticketId" = tt."ticketId"         where tt.rated = true            and ur."rate" in (7,8)       ) "npsPassivePerc",       (         select            (100*count(tt.*))/NULLIF((select count(*) total from traking tt inner join "UserRatings" ur on ur."ticketId" = tt."ticketId" where rated= true),0)         from traking  tt         inner join "UserRatings" ur on ur."ticketId" = tt."ticketId"         where tt.rated = true            and ur."rate" < 7       ) "npsDetractorsPerc",       (         select sum(nps.promoter) - sum(nps.detractor) from (           (select              (100*count(tt.*))/NULLIF((select count(*) total from traking tt inner join "UserRatings" ur on ur."ticketId" = tt."ticketId" where rated= true),0) promoter                   ,0 detractor                     from traking tt                     inner join "UserRatings" ur on ur."ticketId" = tt."ticketId"                 where tt.rated =true                  and ur."rate" > 8           union           select                        0,(100*count(tt.*))/NULLIF((select count(*) total from traking tt inner join "UserRatings" ur on ur."ticketId" = tt."ticketId" where rated= true),0)                     from traking  tt                     inner join "UserRatings" ur on ur."ticketId" = tt."ticketId"                 where tt.rated =true                  and ur.rate < 7)) nps         ) "npsScore" ), attedants as (   select     u1.id,     u1."name",     u1."online",     avg(t."waitTime") "avgWaitTime",     avg(t."supportTime") "avgSupportTime",     count(t."id") "tickets",     round(coalesce(avg(ur."rate"), 0),2) "rating",     coalesce(count(ur."id"), 0) "countRating"   from "Users" u1     left join traking t on t."userId" = u1.id     left join "UserRatings" ur on ur."userId" = t."userId" and ur."ticketId" = t."ticketId"   where u1."companyId" = ?   group by 1, 2   order by u1."name"   )   select       (select coalesce(jsonb_build_object('counters', c.*)->>'counters', '{}')::jsonb from counters c) counters,       (select coalesce(json_agg(a.*), '[]')::jsonb from attedants a) attendants;
  `;
  let where = "where tt.\"companyId\" = ?";
  const replacements = [companyId];
  if (_.has(params, "days")) {
    where += " and tt.\"createdAt\" >= (now() - '? days'::interval)";
    replacements.push(parseInt(("" + params.days).replace(/\D/g, ""), 10));
  }
  if (_.has(params, "date_from")) {
    where += " and tt.\"createdAt\" >= ?";
    replacements.push(params.date_from + " 00:00:00");
  }
  if (_.has(params, "date_to")) {
    where += " and tt.\"createdAt\" <= ?";
    replacements.push(params.date_to + " 23:59:59");
  }
  replacements.push(companyId);
  replacements.push(companyId);
  replacements.push(companyId);
  replacements.push(companyId);
  replacements.push(companyId);
  const finalQuery = query.replace("-- filterPeriod", where);

  const responseData: DashboardData = await sequelize.query(finalQuery, {
    replacements,
    type: QueryTypes.SELECT,
    plain: true
  });

  return responseData;
}
