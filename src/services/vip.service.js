import { load, save } from "../database/jsonDB.js";

export function activateVip({ steam_id, vip_type }) {
  const vipDB = load("vip.json");

  const now = new Date();
  let start = now;
  let end = new Date(now);

  // renovação
  if (vipDB[steam_id] && vipDB[steam_id].active) {
    const currentEnd = new Date(vipDB[steam_id].end_date);
    if (currentEnd > now) start = currentEnd;
  }

  end = new Date(start);
  end.setDate(end.getDate() + 30);

  vipDB[steam_id] = {
    vip_type,
    start_date: start.toISOString(),
    end_date: end.toISOString(),
    active: true
  };

  save("vip.json", vipDB);
}
