import express from "express";
import cors from "cors";
import { query, withTransaction } from "./db.js";

const app = express();

app.use(cors());
app.use(express.json());

const mapCard = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  dueDate: row.due_date,
  coverColor: row.cover_color,
  coverImageUrl: row.cover_image_url,
  archived: row.archived,
  position: row.position,
  createdAt: row.created_at,
});

const getBoardById = async (boardId) => {
  const boardResult = await query(
    "SELECT id, title, background, created_at FROM boards WHERE id = $1",
    [boardId],
  );
  const board = boardResult.rows[0];
  if (!board) return null;

  const [
    listsRes,
    cardsRes,
    labelsRes,
    membersRes,
    checklistsRes,
    checklistItemsRes,
    commentsRes,
    attachmentsRes,
  ] = await Promise.all([
    query(
      "SELECT id, board_id, title, position, color, created_at FROM lists WHERE board_id = $1 ORDER BY position ASC",
      [boardId],
    ),
    query(
      "SELECT id, list_id, title, description, due_date, cover_color, cover_image_url, archived, position, created_at FROM cards WHERE board_id = $1 ORDER BY position ASC",
      [boardId],
    ),
    query(
      "SELECT cl.card_id, l.id, l.text, l.color FROM card_labels cl JOIN labels l ON l.id = cl.label_id JOIN cards c ON c.id = cl.card_id WHERE c.board_id = $1",
      [boardId],
    ),
    query(
      "SELECT cm.card_id, m.id, m.name, m.avatar, m.color FROM card_members cm JOIN members m ON m.id = cm.member_id JOIN cards c ON c.id = cm.card_id WHERE c.board_id = $1",
      [boardId],
    ),
    query("SELECT id, card_id, title FROM checklists WHERE board_id = $1", [
      boardId,
    ]),
    query(
      "SELECT id, checklist_id, text, completed FROM checklist_items WHERE board_id = $1 ORDER BY id ASC",
      [boardId],
    ),
    query(
      "SELECT id, card_id, member_id, text, created_at FROM comments WHERE board_id = $1 ORDER BY created_at ASC",
      [boardId],
    ),
    query(
      "SELECT id, card_id, name, url, created_at FROM card_attachments WHERE board_id = $1 ORDER BY created_at ASC",
      [boardId],
    ),
  ]);

  const labelsByCard = new Map();
  for (const row of labelsRes.rows) {
    if (!labelsByCard.has(row.card_id)) labelsByCard.set(row.card_id, []);
    labelsByCard
      .get(row.card_id)
      .push({ id: row.id, text: row.text, color: row.color });
  }

  const membersByCard = new Map();
  for (const row of membersRes.rows) {
    if (!membersByCard.has(row.card_id)) membersByCard.set(row.card_id, []);
    membersByCard.get(row.card_id).push({
      id: row.id,
      name: row.name,
      avatar: row.avatar,
      color: row.color,
    });
  }

  const checklistItemsByChecklist = new Map();
  for (const row of checklistItemsRes.rows) {
    if (!checklistItemsByChecklist.has(row.checklist_id))
      checklistItemsByChecklist.set(row.checklist_id, []);
    checklistItemsByChecklist
      .get(row.checklist_id)
      .push({ id: row.id, text: row.text, completed: row.completed });
  }

  const checklistsByCard = new Map();
  for (const row of checklistsRes.rows) {
    if (!checklistsByCard.has(row.card_id))
      checklistsByCard.set(row.card_id, []);
    checklistsByCard.get(row.card_id).push({
      id: row.id,
      title: row.title,
      items: checklistItemsByChecklist.get(row.id) || [],
    });
  }

  const commentsByCard = new Map();
  for (const row of commentsRes.rows) {
    if (!commentsByCard.has(row.card_id)) commentsByCard.set(row.card_id, []);
    commentsByCard.get(row.card_id).push({
      id: row.id,
      memberId: row.member_id,
      text: row.text,
      createdAt: row.created_at,
    });
  }

  const attachmentsByCard = new Map();
  for (const row of attachmentsRes.rows) {
    if (!attachmentsByCard.has(row.card_id))
      attachmentsByCard.set(row.card_id, []);
    attachmentsByCard.get(row.card_id).push({
      id: row.id,
      name: row.name,
      url: row.url,
      createdAt: row.created_at,
    });
  }

  const cardsByList = new Map();
  for (const row of cardsRes.rows) {
    if (!cardsByList.has(row.list_id)) cardsByList.set(row.list_id, []);
    cardsByList.get(row.list_id).push({
      ...mapCard(row),
      labels: labelsByCard.get(row.id) || [],
      members: membersByCard.get(row.id) || [],
      checklists: checklistsByCard.get(row.id) || [],
      comments: commentsByCard.get(row.id) || [],
      attachments: attachmentsByCard.get(row.id) || [],
    });
  }

  return {
    id: board.id,
    title: board.title,
    background: board.background,
    createdAt: board.created_at,
    lists: listsRes.rows.map((list) => ({
      id: list.id,
      boardId: list.board_id,
      title: list.title,
      color: list.color,
      position: list.position,
      createdAt: list.created_at,
      cards: cardsByList.get(list.id) || [],
    })),
  };
};

app.get("/api/health", async (_req, res) => {
  await query("SELECT 1");
  res.json({ ok: true });
});

app.get("/api/members", async (_req, res) => {
  const result = await query(
    "SELECT id, name, avatar, color, created_at FROM members ORDER BY name ASC",
  );
  res.json({ members: result.rows });
});

app.post("/api/members", async (req, res) => {
  const { name, avatar, color } = req.body || {};
  if (!name || typeof name !== "string") {
    return res.status(400).json({ error: "name is required" });
  }
  const initials =
    avatar ||
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  const colorValue = color || "hsl(210 79% 46%)";
  const created = await query(
    "INSERT INTO members(name, avatar, color) VALUES ($1, $2, $3) RETURNING id, name, avatar, color, created_at",
    [name.trim(), initials, colorValue],
  );
  res.status(201).json(created.rows[0]);
});

app.get("/api/boards", async (_req, res) => {
  const result = await query(
    "SELECT id, title, background, created_at FROM boards ORDER BY created_at ASC",
  );
  res.json({ boards: result.rows });
});

app.post("/api/boards", async (req, res) => {
  const { title, background } = req.body || {};
  if (!title || typeof title !== "string") {
    return res.status(400).json({ error: "title is required" });
  }
  const result = await query(
    "INSERT INTO boards(title, background) VALUES ($1, $2) RETURNING id, title, background, created_at",
    [title.trim(), background || "hsl(210 60% 48%)"],
  );
  res.status(201).json(result.rows[0]);
});

app.get("/api/boards/:boardId", async (req, res) => {
  const board = await getBoardById(req.params.boardId);
  if (!board) {
    return res.status(404).json({ error: "board not found" });
  }
  res.json(board);
});

app.patch("/api/boards/:boardId", async (req, res) => {
  const { title, background } = req.body || {};
  const result = await query(
    "UPDATE boards SET title = COALESCE($1, title), background = COALESCE($2, background) WHERE id = $3 RETURNING id, title, background, created_at",
    [title, background, req.params.boardId],
  );
  if (!result.rows[0]) {
    return res.status(404).json({ error: "board not found" });
  }
  res.json(result.rows[0]);
});

app.delete("/api/boards/:boardId", async (req, res) => {
  const result = await query("DELETE FROM boards WHERE id = $1 RETURNING id", [
    req.params.boardId,
  ]);
  if (!result.rows[0]) {
    return res.status(404).json({ error: "board not found" });
  }
  res.status(204).send();
});

app.post("/api/boards/:boardId/lists", async (req, res) => {
  const { title, color } = req.body || {};
  if (!title || typeof title !== "string") {
    return res.status(400).json({ error: "title is required" });
  }
  const result = await query(
    "INSERT INTO lists(board_id, title, position, color) VALUES ($1, $2, COALESCE((SELECT MAX(position) + 1 FROM lists WHERE board_id = $1), 0), $3) RETURNING id, board_id, title, position, color, created_at",
    [req.params.boardId, title.trim(), color || null],
  );
  res.status(201).json(result.rows[0]);
});

app.patch("/api/lists/:listId", async (req, res) => {
  const { title, color } = req.body || {};
  const result = await query(
    "UPDATE lists SET title = COALESCE($1, title), color = $2 WHERE id = $3 RETURNING id, board_id, title, position, color, created_at",
    [title, color, req.params.listId],
  );
  if (!result.rows[0]) {
    return res.status(404).json({ error: "list not found" });
  }
  res.json(result.rows[0]);
});

app.delete("/api/lists/:listId", async (req, res) => {
  const result = await query("DELETE FROM lists WHERE id = $1 RETURNING id", [
    req.params.listId,
  ]);
  if (!result.rows[0]) {
    return res.status(404).json({ error: "list not found" });
  }
  res.status(204).send();
});

app.post("/api/boards/:boardId/lists/reorder", async (req, res) => {
  const { orderedListIds } = req.body || {};
  if (!Array.isArray(orderedListIds)) {
    return res.status(400).json({ error: "orderedListIds must be an array" });
  }

  await withTransaction(async (client) => {
    for (let i = 0; i < orderedListIds.length; i += 1) {
      await client.query(
        "UPDATE lists SET position = $1 WHERE id = $2 AND board_id = $3",
        [i, orderedListIds[i], req.params.boardId],
      );
    }
  });

  res.json({ ok: true });
});

app.post("/api/lists/:listId/cards", async (req, res) => {
  const { title, description, dueDate, coverColor, coverImageUrl } =
    req.body || {};
  if (!title || typeof title !== "string") {
    return res.status(400).json({ error: "title is required" });
  }

  const listRes = await query("SELECT board_id FROM lists WHERE id = $1", [
    req.params.listId,
  ]);
  const list = listRes.rows[0];
  if (!list) {
    return res.status(404).json({ error: "list not found" });
  }

  const result = await query(
    "INSERT INTO cards(board_id, list_id, title, description, due_date, cover_color, cover_image_url, position) VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE((SELECT MAX(position) + 1 FROM cards WHERE list_id = $2), 0)) RETURNING id, board_id, list_id, title, description, due_date, cover_color, cover_image_url, archived, position, created_at",
    [
      list.board_id,
      req.params.listId,
      title.trim(),
      description || "",
      dueDate || null,
      coverColor || null,
      coverImageUrl || null,
    ],
  );

  res.status(201).json(mapCard(result.rows[0]));
});

app.patch("/api/cards/:cardId", async (req, res) => {
  const {
    title,
    description,
    dueDate,
    coverColor,
    coverImageUrl,
    archived,
    listId,
    position,
  } = req.body || {};
  const result = await query(
    "UPDATE cards SET title = COALESCE($1, title), description = COALESCE($2, description), due_date = $3, cover_color = $4, cover_image_url = $5, archived = COALESCE($6, archived), list_id = COALESCE($7, list_id), position = COALESCE($8, position) WHERE id = $9 RETURNING id, list_id, title, description, due_date, cover_color, cover_image_url, archived, position, created_at",
    [
      title,
      description,
      dueDate,
      coverColor,
      coverImageUrl,
      archived,
      listId,
      position,
      req.params.cardId,
    ],
  );
  if (!result.rows[0]) {
    return res.status(404).json({ error: "card not found" });
  }
  res.json(mapCard(result.rows[0]));
});

app.delete("/api/cards/:cardId", async (req, res) => {
  const result = await query("DELETE FROM cards WHERE id = $1 RETURNING id", [
    req.params.cardId,
  ]);
  if (!result.rows[0]) {
    return res.status(404).json({ error: "card not found" });
  }
  res.status(204).send();
});

app.post("/api/lists/:listId/cards/reorder", async (req, res) => {
  const { orderedCardIds } = req.body || {};
  if (!Array.isArray(orderedCardIds)) {
    return res.status(400).json({ error: "orderedCardIds must be an array" });
  }

  await withTransaction(async (client) => {
    for (let i = 0; i < orderedCardIds.length; i += 1) {
      await client.query(
        "UPDATE cards SET position = $1 WHERE id = $2 AND list_id = $3",
        [i, orderedCardIds[i], req.params.listId],
      );
    }
  });

  res.json({ ok: true });
});

app.post("/api/cards/:cardId/move", async (req, res) => {
  const { toListId, newIndex } = req.body || {};
  if (!toListId || typeof newIndex !== "number") {
    return res
      .status(400)
      .json({ error: "toListId and newIndex are required" });
  }

  await withTransaction(async (client) => {
    const cardRes = await client.query(
      "SELECT id, list_id FROM cards WHERE id = $1",
      [req.params.cardId],
    );
    const card = cardRes.rows[0];
    if (!card) {
      throw Object.assign(new Error("card not found"), { statusCode: 404 });
    }

    await client.query(
      "UPDATE cards SET position = position - 1 WHERE list_id = $1 AND position > (SELECT position FROM cards WHERE id = $2)",
      [card.list_id, req.params.cardId],
    );
    await client.query(
      "UPDATE cards SET position = position + 1 WHERE list_id = $1 AND position >= $2",
      [toListId, newIndex],
    );
    await client.query(
      "UPDATE cards SET list_id = $1, position = $2 WHERE id = $3",
      [toListId, newIndex, req.params.cardId],
    );
  });

  res.json({ ok: true });
});

app.post("/api/cards/:cardId/labels", async (req, res) => {
  const { text, color } = req.body || {};
  if (!color || typeof color !== "string") {
    return res.status(400).json({ error: "color is required" });
  }

  const created = await withTransaction(async (client) => {
    const labelRes = await client.query(
      "INSERT INTO labels(text, color) VALUES ($1, $2) RETURNING id, text, color",
      [text || "", color],
    );
    await client.query(
      "INSERT INTO card_labels(card_id, label_id) VALUES ($1, $2)",
      [req.params.cardId, labelRes.rows[0].id],
    );
    return labelRes.rows[0];
  });

  res.status(201).json(created);
});

app.delete("/api/cards/:cardId/labels/:labelId", async (req, res) => {
  await withTransaction(async (client) => {
    await client.query(
      "DELETE FROM card_labels WHERE card_id = $1 AND label_id = $2",
      [req.params.cardId, req.params.labelId],
    );
    await client.query("DELETE FROM labels WHERE id = $1", [
      req.params.labelId,
    ]);
  });
  res.status(204).send();
});

app.put("/api/cards/:cardId/members", async (req, res) => {
  const { memberIds } = req.body || {};
  if (!Array.isArray(memberIds)) {
    return res.status(400).json({ error: "memberIds must be an array" });
  }

  await withTransaction(async (client) => {
    await client.query("DELETE FROM card_members WHERE card_id = $1", [
      req.params.cardId,
    ]);
    for (const memberId of memberIds) {
      await client.query(
        "INSERT INTO card_members(card_id, member_id) VALUES ($1, $2)",
        [req.params.cardId, memberId],
      );
    }
  });

  res.json({ ok: true });
});

app.post("/api/cards/:cardId/checklists", async (req, res) => {
  const { title } = req.body || {};
  const cardRes = await query("SELECT board_id FROM cards WHERE id = $1", [
    req.params.cardId,
  ]);
  const card = cardRes.rows[0];
  if (!card) {
    return res.status(404).json({ error: "card not found" });
  }

  const result = await query(
    "INSERT INTO checklists(card_id, board_id, title) VALUES ($1, $2, $3) RETURNING id, card_id, title",
    [req.params.cardId, card.board_id, title || "Checklist"],
  );
  res.status(201).json({ ...result.rows[0], items: [] });
});

app.delete("/api/checklists/:checklistId", async (req, res) => {
  const result = await query(
    "DELETE FROM checklists WHERE id = $1 RETURNING id",
    [req.params.checklistId],
  );
  if (!result.rows[0]) {
    return res.status(404).json({ error: "checklist not found" });
  }
  res.status(204).send();
});

app.post("/api/checklists/:checklistId/items", async (req, res) => {
  const { text } = req.body || {};
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "text is required" });
  }

  const checklistRes = await query(
    "SELECT board_id FROM checklists WHERE id = $1",
    [req.params.checklistId],
  );
  const checklist = checklistRes.rows[0];
  if (!checklist) {
    return res.status(404).json({ error: "checklist not found" });
  }

  const result = await query(
    "INSERT INTO checklist_items(checklist_id, board_id, text, completed) VALUES ($1, $2, $3, FALSE) RETURNING id, checklist_id, text, completed",
    [req.params.checklistId, checklist.board_id, text],
  );
  res.status(201).json(result.rows[0]);
});

app.patch("/api/checklist-items/:itemId", async (req, res) => {
  const { completed, text } = req.body || {};
  const result = await query(
    "UPDATE checklist_items SET completed = COALESCE($1, completed), text = COALESCE($2, text) WHERE id = $3 RETURNING id, checklist_id, text, completed",
    [completed, text, req.params.itemId],
  );
  if (!result.rows[0]) {
    return res.status(404).json({ error: "checklist item not found" });
  }
  res.json(result.rows[0]);
});

app.delete("/api/checklist-items/:itemId", async (req, res) => {
  const result = await query(
    "DELETE FROM checklist_items WHERE id = $1 RETURNING id",
    [req.params.itemId],
  );
  if (!result.rows[0]) {
    return res.status(404).json({ error: "checklist item not found" });
  }
  res.status(204).send();
});

app.post("/api/cards/:cardId/comments", async (req, res) => {
  const { memberId, text } = req.body || {};
  if (!memberId || !text) {
    return res.status(400).json({ error: "memberId and text are required" });
  }

  const cardRes = await query("SELECT board_id FROM cards WHERE id = $1", [
    req.params.cardId,
  ]);
  const card = cardRes.rows[0];
  if (!card) {
    return res.status(404).json({ error: "card not found" });
  }

  const result = await query(
    "INSERT INTO comments(card_id, board_id, member_id, text) VALUES ($1, $2, $3, $4) RETURNING id, card_id, member_id, text, created_at",
    [req.params.cardId, card.board_id, memberId, text],
  );
  res.status(201).json(result.rows[0]);
});

app.post("/api/cards/:cardId/attachments", async (req, res) => {
  const { name, url } = req.body || {};
  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "url is required" });
  }

  const cardRes = await query("SELECT board_id FROM cards WHERE id = $1", [
    req.params.cardId,
  ]);
  const card = cardRes.rows[0];
  if (!card) {
    return res.status(404).json({ error: "card not found" });
  }

  const attachmentName =
    typeof name === "string" && name.trim().length > 0
      ? name.trim()
      : url.trim();

  const result = await query(
    "INSERT INTO card_attachments(card_id, board_id, name, url) VALUES ($1, $2, $3, $4) RETURNING id, card_id, name, url, created_at",
    [req.params.cardId, card.board_id, attachmentName, url.trim()],
  );

  res.status(201).json({
    id: result.rows[0].id,
    cardId: result.rows[0].card_id,
    name: result.rows[0].name,
    url: result.rows[0].url,
    createdAt: result.rows[0].created_at,
  });
});

app.delete("/api/attachments/:attachmentId", async (req, res) => {
  const result = await query(
    "DELETE FROM card_attachments WHERE id = $1 RETURNING id",
    [req.params.attachmentId],
  );
  if (!result.rows[0]) {
    return res.status(404).json({ error: "attachment not found" });
  }
  res.status(204).send();
});

app.use((err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  res
    .status(statusCode)
    .json({ error: err.message || "Internal server error" });
});

export default app;
