# 42 — Project Board

> How work is tracked when most of the code is written by agents. One person decides; several agents build. The board's job is to answer two questions fast: **what needs me right now?** and **what can an agent pick up next?**

---

## Two layers, on purpose

| Layer                     | Lives in                                                    | Who reads it        | Holds                               |
| ------------------------- | ----------------------------------------------------------- | ------------------- | ----------------------------------- |
| **Labels and milestones** | The repo ([`.github/labels.yml`](../../.github/labels.yml)) | Agents **and** Elia | Type, agent state, priority, epic   |
| **GitHub Project fields** | The _Jamly_ Project                                         | Elia only           | Status column, size, planning views |

Agents work from a cloud session that can reach issues and labels through the REST API, but **not** GitHub Projects. So everything an agent needs to read or signal is a label. The Project is Elia's planning surface, built on top.

---

## Labels

The full list, with colours and descriptions, is in [`.github/labels.yml`](../../.github/labels.yml). The ones that carry the workflow:

| Label                | Set by                      | Means                                                                   |
| -------------------- | --------------------------- | ----------------------------------------------------------------------- |
| `agent:ready`        | Elia                        | The spec is complete. An agent may start.                               |
| `agent:working`      | Agent, when it starts       | Someone is on it. Don't start a second agent.                           |
| `needs:elia`         | Agent or Elia               | Blocked on Elia: a product decision, a plan to approve, a PR to review. |
| `needs:device-check` | Agent, when the PR is green | Code is done. Elia checks iOS + Android, offline, dark.                 |

Plus one `type:*` per issue, one `priority:*`, and one `epic:*` for product work (`area:harness` for work on how agents operate).

**Rules:**

1. An issue without `agent:ready` is not started by an agent, however obvious it looks.
2. An agent that stops for any reason other than "done" adds `needs:elia` and says why in a comment.
3. `needs:*` labels are removed by Elia when he's dealt with them.

---

## Milestones

One per roadmap milestone ([12-roadmap](../product/12-roadmap.md)), created when the milestone starts — not before. Currently: **v0.1 — The band loop**. Every product issue belongs to one.

---

## The Project

A single GitHub Project, _Jamly_, linked to this repo. Created by hand: Projects aren't reachable from a Claude session.

### Fields

| Field                        | Type          | Values                                                        |
| ---------------------------- | ------------- | ------------------------------------------------------------- |
| **Status**                   | Single select | Inbox · Ready · In progress · In review · Device check · Done |
| **Size**                     | Single select | S (one agent session) · M (a few) · L (split it)              |
| Milestone, Labels, Assignees | Built in      | —                                                             |

An **L** is a signal, not a size: split it before marking it `agent:ready`.

### Views

| View            | Layout | Filter / grouping                                                                               | Answers                                |
| --------------- | ------ | ----------------------------------------------------------------------------------------------- | -------------------------------------- |
| **Needs me**    | Table  | `label:needs:elia,needs:device-check` · sorted by priority                                      | What's waiting on me? Open this first. |
| **Board**       | Board  | Columns by Status · `-status:Done`                                                              | Where is everything?                   |
| **Agent queue** | Table  | `label:agent:ready -label:agent:working` · sorted by priority                                   | What can an agent pick up next?        |
| **v0.1**        | Table  | `milestone:"v0.1 — The band loop"` · sorted by priority; add `label:epic:…` to look at one epic | How far is the milestone?              |
| **Audit inbox** | Table  | `label:type:audit is:open`                                                                      | What has the auditor proposed?         |

### Built-in workflows to switch on

- **Auto-add to project:** issues and PRs from `EliaFerraro/jamly` → Status _Inbox_
- **Item closed** → _Done_
- **Pull request merged** → _Done_
- **Auto-archive:** items _Done_ for 14 days

### How Status maps to labels

Status is moved by Elia; labels are the agents' signal. They line up like this:

| Status       | Typical labels         |
| ------------ | ---------------------- |
| Inbox        | — (not specced yet)    |
| Ready        | `agent:ready`          |
| In progress  | `agent:working`        |
| In review    | `needs:elia` on the PR |
| Device check | `needs:device-check`   |
| Done         | closed                 |

When the two disagree, the labels win: they are what the agents act on.

---

## Setting it up (10 minutes, on a computer)

1. GitHub → your profile → **Projects** → **New project** → _Board_ → name it **Jamly**.
2. **Settings → Manage access**: link the repository `EliaFerraro/jamly`.
3. Edit the **Status** field to the six values above; add the **Size** field.
4. **Workflows**: switch on the four listed above.
5. Create the five views. Save each filter.
6. Add the open issues and PRs (the auto-add workflow only catches new ones).

---

**Related:** [40 — Ways of Working](40-ways-of-working.md) · [41 — Decision Log](41-decision-log.md) · [12 — Roadmap](../product/12-roadmap.md)
