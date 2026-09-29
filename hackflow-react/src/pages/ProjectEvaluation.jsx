import { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Code2,
  Bell,
  ChevronDown,
  ArrowLeft,
  ExternalLink,
  FileText,
  Lightbulb,
  Terminal,
  Brain,
  Target,
  MonitorPlay,
  Users,
  Star,
  MessageSquare,
  Send,
  Shield,
  Minus,
  Plus,
  Trophy,
} from "lucide-react";

import {
  getJudge,
  getJudgeProject,
  getMyScore,
  getRubric,
  saveScore,
} from "../services/hackflowApi";

/* -------------------------------------------------------
   Helpers
------------------------------------------------------- */

const CRITERION_ICONS = {
  innovation: Lightbulb,
  creativity: Lightbulb,
  functionality: Target,
  technical: Terminal,
  technical_implementation: Terminal,
  quality: Terminal,
  code_quality: Terminal,
  ai: Brain,
  ai_ml: Brain,
  impact: Target,
  relevance: Target,
  presentation: MonitorPlay,
  demo: MonitorPlay,
  teamwork: Users,
  execution: Users,
};

function getCriterionIcon(criterion) {
  if (!criterion) return Star;

  const key = String(
    criterion.id ||
      criterion.key ||
      criterion.name ||
      ""
  )
    .toLowerCase()
    .replace(/\s+/g, "_");

  return CRITERION_ICONS[key] || Star;
}

function getCriterionTitle(criterion) {
  return (
    criterion?.name ||
    criterion?.title ||
    criterion?.label ||
    criterion?.id ||
    "Criterion"
  );
}

function getCriterionNote(criterion) {
  return (
    criterion?.description ||
    criterion?.note ||
    "Evaluate the project against this criterion."
  );
}

function getCriterionWeight(criterion) {
  return Number(criterion?.weight ?? 0);
}

function getCriterionMaxScore(criterion) {
  return Number(criterion?.max_score ?? 5);
}

function getInitials(name) {
  if (!name) return "JD";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatSubmittedDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function verdict(score) {
  if (score >= 4.25) {
    return {
      label: "Excellent",
      color: "#4ADE80",
    };
  }

  if (score >= 3.5) {
    return {
      label: "Strong",
      color: "#7C5CFC",
    };
  }

  if (score >= 2.5) {
    return {
      label: "Fair",
      color: "#EAB308",
    };
  }

  return {
    label: "Needs work",
    color: "#F87171",
  };
}

/* -------------------------------------------------------
   Main component
------------------------------------------------------- */

export default function ProjectEvaluation() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [judge, setJudge] = useState(null);
  const [project, setProject] = useState(null);
  const [rubric, setRubric] = useState(null);
  const [existingScore, setExistingScore] = useState(null);

  const [scores, setScores] = useState({});
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  /* -------------------------------------------------------
     Load judge + project + rubric + current score
  ------------------------------------------------------- */

  useEffect(() => {
    let cancelled = false;

    async function loadEvaluation() {
      try {
        setLoading(true);
        setError("");
        setSubmitted(false);

        const [
          judgeData,
          projectData,
          rubricData,
          scoreData,
        ] = await Promise.all([
          getJudge(),
          getJudgeProject(projectId),
          getRubric(),
          getMyScore(null, projectId),
        ]);

        if (cancelled) return;

        setJudge(judgeData);
        setProject(projectData);
        setRubric(rubricData);
        setExistingScore(scoreData || null);

        /*
         * If the judge has already scored this project,
         * load those values.
         *
         * Otherwise initialize every criterion to 3
         * or to the middle of its configured range.
         */
        const initialScores = {};

        const criteria = Array.isArray(rubricData?.criteria)
          ? rubricData.criteria
          : [];

        criteria.forEach((criterion) => {
          const criterionId = criterion.id;

          const maxScore = getCriterionMaxScore(
            criterion
          );

          const defaultScore =
            scoreData?.criteria?.[criterionId] ??
            Math.ceil(maxScore / 2);

          initialScores[criterionId] = Math.min(
            maxScore,
            Math.max(0, Number(defaultScore))
          );
        });

        setScores(initialScores);

        setComment(scoreData?.comment || "");

        if (scoreData) {
          setSubmitted(true);
        }
      } catch (err) {
        console.error(
          "Failed to load project evaluation:",
          err
        );

        if (!cancelled) {
          setError(
            err.message ||
              "Failed to load project evaluation."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (!projectId) {
      setError("No project was selected.");
      setLoading(false);
      return;
    }

    loadEvaluation();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  /* -------------------------------------------------------
     Weighted score
     
     Backend rubric may have different max scores and
     weights. We normalize the result to 5.
  ------------------------------------------------------- */

  const weightedScore = useMemo(() => {
    const criteria = Array.isArray(rubric?.criteria)
      ? rubric.criteria
      : [];

    if (criteria.length === 0) {
      return 0;
    }

    let weightedTotal = 0;
    let totalWeight = 0;

    criteria.forEach((criterion) => {
      const criterionId = criterion.id;

      const score = Number(
        scores[criterionId] ?? 0
      );

      const maxScore =
        getCriterionMaxScore(criterion);

      const weight =
        getCriterionWeight(criterion);

      if (maxScore <= 0 || weight <= 0) {
        return;
      }

      weightedTotal +=
        (score / maxScore) * weight;

      totalWeight += weight;
    });

    if (totalWeight === 0) {
      return 0;
    }

    /*
     * Convert the weighted normalized score
     * to a score out of 5.
     */
    return (
      (weightedTotal / totalWeight) * 5
    );
  }, [scores, rubric]);

  const v = verdict(weightedScore);

  /* -------------------------------------------------------
     Change score
  ------------------------------------------------------- */

  const setScore = (criterionId, delta) => {
    setScores((current) => {
      const criterion =
        rubric?.criteria?.find(
          (item) => item.id === criterionId
        );

      const maxScore =
        getCriterionMaxScore(criterion);

      const currentScore = Number(
        current[criterionId] ?? 0
      );

      return {
        ...current,

        [criterionId]: Math.min(
          maxScore,
          Math.max(
            0,
            currentScore + delta
          )
        ),
      };
    });
  };

  /* -------------------------------------------------------
     Submit / update evaluation
  ------------------------------------------------------- */

  const handleSubmit = async () => {
    if (!projectId) {
      setError("No project selected.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const savedScore = await saveScore({
        projectId,
        criteria: scores,
        comment: comment.trim(),
      });

      setExistingScore(savedScore || null);
      setSubmitted(true);
    } catch (err) {
      console.error(
        "Failed to save evaluation:",
        err
      );

      setError(
        err.message ||
          "Failed to save evaluation."
      );
    } finally {
      setSaving(false);
    }
  };

  /* -------------------------------------------------------
     Loading state
  ------------------------------------------------------- */

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0F1115",
          color: "#E8E6F0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div
          style={{
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              border: "3px solid #262A34",
              borderTopColor: "#7C5CFC",
              margin: "0 auto 16px",
              animation:
                "hackflow-spin 0.8s linear infinite",
            }}
          />

          <div
            style={{
              fontSize: 14,
              color: "#9A96AC",
            }}
          >
            Loading project evaluation...
          </div>

          <style>
            {`
              @keyframes hackflow-spin {
                from {
                  transform: rotate(0deg);
                }
                to {
                  transform: rotate(360deg);
                }
              }
            `}
          </style>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------
     Error state
  ------------------------------------------------------- */

  if (error && !project) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0F1115",
          color: "#E8E6F0",
          fontFamily: "Inter, sans-serif",
          padding: "40px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 700,
            margin: "0 auto",
            background: "#14161C",
            border: "1px solid #1D2029",
            borderRadius: 14,
            padding: 24,
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              marginBottom: 10,
            }}
          >
            Unable to load project
          </div>

          <div
            style={{
              color: "#F87171",
              fontSize: 14,
              lineHeight: 1.6,
              marginBottom: 20,
            }}
          >
            {error}
          </div>

          <button
            onClick={() =>
              navigate("/judge/dashboard")
            }
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background:
                "linear-gradient(135deg, #8A6EFC, #6D4FE8)",
              color: "#FFFFFF",
              border: "none",
              padding: "10px 16px",
              borderRadius: 9,
              fontSize: 13.5,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <ArrowLeft size={14} />
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------
     Normalize project data
  ------------------------------------------------------- */

  const projectTeam =
    project?.team || {
      id: project?.team_id,
      name:
        project?.team_name ||
        "Unknown Team",
      members: [],
    };

  const teamMembers = Array.isArray(
    projectTeam.members
  )
    ? projectTeam.members
    : [];

  const projectTrack =
    project?.track ||
    project?.track_name ||
    project?.track_id ||
    "Unknown";

  const repoUrl =
    project?.repoUrl ||
    project?.repo_url ||
    project?.repository_url ||
    "";

  const submittedAt =
    project?.submittedAt ||
    project?.submitted_at ||
    "";

  const criteria = Array.isArray(
    rubric?.criteria
  )
    ? rubric.criteria
    : [];

  /*
   * Useful text for the average-score section.
   */
  const scoreString = criteria
    .map(
      (criterion) =>
        scores[criterion.id] ?? 0
    )
    .join(" + ");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0F1115",
        fontFamily: "Inter, sans-serif",
        color: "#E8E6F0",
      }}
    >
      <style>{`
        * {
          box-sizing: border-box;
        }

        .layout {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 20px;
          align-items: start;
        }

        @media (max-width: 1020px) {
          .layout {
            grid-template-columns: 1fr;
          }
        }

        .head-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 20px;
        }

        .crit-row {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          padding: 16px 18px;
        }

        .crit-info {
          display: flex;
          gap: 12px;
          flex: 1;
          min-width: 220px;
        }

        .crit-control {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-left: auto;
        }

        textarea {
          width: 100%;
          min-height: 90px;
          background: #0F1115;
          border: 1px solid #262A34;
          border-radius: 9px;
          padding: 12px 14px;
          color: #E8E6F0;
          font-family: Inter, sans-serif;
          font-size: 13.5px;
          outline: none;
          resize: vertical;
        }

        textarea:focus {
          border-color: #7C5CFC;
        }

        .project-link:hover {
          border-color: #7C5CFC !important;
        }

        .back-button:hover {
          color: #FFFFFF !important;
        }
      `}</style>

      {/* -------------------------------------------------
          Top bar
      ------------------------------------------------- */}

      <div
        style={{
          borderBottom:
            "1px solid #1D2029",
          padding: "16px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1320,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: 28,
            flexWrap: "wrap",
          }}
        >
          {/* Logo */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 7,
                background: "#7C5CFC",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Code2
                size={16}
                color="#0F1115"
                strokeWidth={2.5}
              />
            </div>

            <span
              style={{
                fontFamily:
                  "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: 16,
              }}
            >
              HackFlow
            </span>
          </div>

          {/* Navigation */}

          <div
            style={{
              display: "flex",
              gap: 22,
              flex: 1,
            }}
          >
            <span
              style={{
                fontSize: 14,
                color: "#9A96AC",
              }}
            >
              Home
            </span>

            <span
              style={{
                fontSize: 14,
                color: "#9A96AC",
              }}
            >
              Hackathons
            </span>

            <span
              style={{
                fontSize: 14,
                color: "#9A96AC",
              }}
            >
              Projects
            </span>

            <span
              style={{
                fontSize: 14,
                color: "#B8A9FD",
                fontWeight: 500,
                borderBottom:
                  "2px solid #7C5CFC",
                paddingBottom: 16,
                marginBottom: -17,
              }}
            >
              Judge Dashboard
            </span>
          </div>

          {/* Judge information */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                position: "relative",
              }}
            >
              <Bell
                size={18}
                color="#9A96AC"
              />

              <span
                style={{
                  position: "absolute",
                  top: -3,
                  right: -3,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#F87171",
                  border:
                    "1.5px solid #0F1115",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background:
                    "rgba(124,92,252,0.25)",
                  border:
                    "1px solid #7C5CFC",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: "#B8A9FD",
                }}
              >
                {getInitials(judge?.name)}
              </div>

              <div>
                <div
                  style={{
                    fontSize: 13.5,
                    fontWeight: 500,
                    lineHeight: 1.2,
                  }}
                >
                  {judge?.name ||
                    "Judge"}
                </div>

                <div
                  style={{
                    fontSize: 11,
                    color: "#5B5F6D",
                    lineHeight: 1.2,
                  }}
                >
                  Judge
                </div>
              </div>

              <ChevronDown
                size={14}
                color="#5B5F6D"
              />
            </div>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------
          Main content
      ------------------------------------------------- */}

      <div
        style={{
          maxWidth: 1320,
          margin: "0 auto",
          padding:
            "24px 24px 80px",
        }}
      >
        {/* Back */}

        <button
          className="back-button"
          onClick={() =>
            navigate("/judge/dashboard")
          }
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            color: "#B8A9FD",
            background: "transparent",
            border: "none",
            padding: 0,
            textDecoration: "none",
            fontSize: 14,
            fontWeight: 500,
            marginBottom: 20,
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={15} />
          Back to dashboard
        </button>

        {/* Error banner */}

        {error && (
          <div
            style={{
              background:
                "rgba(248,113,113,0.08)",
              border:
                "1px solid rgba(248,113,113,0.3)",
              color: "#F87171",
              borderRadius: 10,
              padding: "12px 14px",
              marginBottom: 20,
              fontSize: 13.5,
            }}
          >
            {error}
          </div>
        )}

        {/* -------------------------------------------------
            Project header
        ------------------------------------------------- */}

        <div
          className="head-row"
          style={{
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 18,
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 14,
                background:
                  "linear-gradient(135deg, #4C3BCF, #7C5CFC)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Shield
                size={26}
                color="#FFFFFF"
              />
            </div>

            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 8,
                  flexWrap: "wrap",
                }}
              >
                <h1
                  style={{
                    fontFamily:
                      "'Space Grotesk', sans-serif",
                    fontSize:
                      "clamp(20px, 3.5vw, 26px)",
                    fontWeight: 600,
                    margin: 0,
                  }}
                >
                  {project?.title ||
                    "Untitled Project"}
                </h1>

                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#B8A9FD",
                    background:
                      "rgba(124,92,252,0.15)",
                    padding:
                      "3px 10px",
                    borderRadius: 20,
                  }}
                >
                  {project?.id ||
                    projectId}
                </span>

                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: submitted
                      ? "#4ADE80"
                      : "#EAB308",
                    background:
                      submitted
                        ? "rgba(74,222,128,0.12)"
                        : "rgba(234,179,8,0.12)",
                    padding:
                      "3px 10px",
                    borderRadius: 20,
                  }}
                >
                  {submitted
                    ? "Scored"
                    : "Pending"}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 18,
                  flexWrap: "wrap",
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 13,
                    color: "#9A96AC",
                  }}
                >
                  <Shield size={13} />
                  {projectTrack} Track
                </span>

                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 13,
                    color: "#9A96AC",
                  }}
                >
                  <Users size={13} />
                  Team{" "}
                  {projectTeam.name} ·{" "}
                  {teamMembers.length}{" "}
                  members
                </span>
              </div>

              <p
                style={{
                  fontSize: 13.5,
                  color: "#9A96AC",
                  margin: 0,
                  maxWidth: 460,
                  lineHeight: 1.55,
                }}
              >
                {project?.summary ||
                  "No project summary provided."}
              </p>
            </div>
          </div>

          {/* Quick links */}

          <div
            style={{
              background: "#14161C",
              border:
                "1px solid #1D2029",
              borderRadius: 14,
              padding:
                "16px 20px",
              minWidth: 240,
            }}
          >
            <div
              style={{
                fontSize: 13.5,
                fontWeight: 600,
                marginBottom: 12,
              }}
            >
              Quick links
            </div>

            <div
              style={{
                display: "flex",
                flexDirection:
                  "column",
                gap: 10,
              }}
            >
              {repoUrl ? (
                <>
                  <QuickLink
                    icon={ExternalLink}
                    label="Project repository"
                    href={repoUrl}
                  />

                  <QuickLink
                    icon={FileText}
                    label="Submission notes"
                    href={repoUrl}
                  />
                </>
              ) : (
                <span
                  style={{
                    fontSize: 13,
                    color: "#5B5F6D",
                  }}
                >
                  No project links provided.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* -------------------------------------------------
            Layout
        ------------------------------------------------- */}

        <div className="layout">
          {/* =================================================
              Main column
          ================================================= */}

          <div>
            <Panel>
              <h2
                style={{
                  fontFamily:
                    "'Space Grotesk', sans-serif",
                  fontSize: 18,
                  fontWeight: 600,
                  margin:
                    "0 0 4px",
                }}
              >
                Evaluation criteria
              </h2>

              <p
                style={{
                  fontSize: 13.5,
                  color: "#9A96AC",
                  margin:
                    "0 0 4px",
                }}
              >
                Rate the project according to
                the configured judging rubric.
              </p>

              {/* Criteria */}

              <div
                style={{
                  display: "flex",
                  flexDirection:
                    "column",
                }}
              >
                {criteria.length ===
                0 ? (
                  <div
                    style={{
                      padding:
                        "30px 10px",
                      textAlign:
                        "center",
                      color: "#5B5F6D",
                      fontSize: 13.5,
                    }}
                  >
                    No judging criteria
                    have been configured.
                  </div>
                ) : (
                  criteria.map(
                    (
                      criterion,
                      index
                    ) => {
                      const Icon =
                        getCriterionIcon(
                          criterion
                        );

                      const criterionId =
                        criterion.id;

                      const maxScore =
                        getCriterionMaxScore(
                          criterion
                        );

                      const weight =
                        getCriterionWeight(
                          criterion
                        );

                      const currentScore =
                        Number(
                          scores[
                            criterionId
                          ] ?? 0
                        );

                      return (
                        <div
                          key={
                            criterionId
                          }
                          className="crit-row"
                          style={{
                            borderTop:
                              index === 0
                                ? "none"
                                : "1px solid #1D2029",
                          }}
                        >
                          <div className="crit-info">
                            <div
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: 9,
                                background:
                                  "rgba(124,92,252,0.15)",
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "center",
                                flexShrink: 0,
                              }}
                            >
                              <Icon
                                size={16}
                                color="#B8A9FD"
                              />
                            </div>

                            <div>
                              <div
                                style={{
                                  fontSize: 14,
                                  fontWeight: 600,
                                  color:
                                    "#E8E6F0",
                                  marginBottom:
                                    2,
                                }}
                              >
                                {getCriterionTitle(
                                  criterion
                                )}
                              </div>

                              <div
                                style={{
                                  fontSize: 12.5,
                                  color:
                                    "#5B5F6D",
                                }}
                              >
                                {getCriterionNote(
                                  criterion
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="crit-control">
                            <ScoreStepper
                              value={
                                currentScore
                              }
                              maxScore={
                                maxScore
                              }
                              onDec={() =>
                                setScore(
                                  criterionId,
                                  -1
                                )
                              }
                              onInc={() =>
                                setScore(
                                  criterionId,
                                  1
                                )
                              }
                            />

                            <div
                              style={{
                                textAlign:
                                  "right",
                                minWidth: 75,
                              }}
                            >
                              <div
                                style={{
                                  fontSize: 14,
                                  fontWeight: 700,
                                }}
                              >
                                {
                                  currentScore
                                }{" "}
                                /{" "}
                                {maxScore}
                              </div>

                              <div
                                style={{
                                  fontSize: 11,
                                  color:
                                    "#5B5F6D",
                                }}
                              >
                                {weight}%
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )
                )}
              </div>

              {/* Weighted score */}

              <div
                style={{
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "space-between",
                  flexWrap: "wrap",
                  gap: 14,
                  background:
                    "rgba(124,92,252,0.08)",
                  border:
                    "1px solid rgba(124,92,252,0.3)",
                  borderRadius: 12,
                  padding:
                    "16px 20px",
                  marginTop: 18,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems:
                      "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 9,
                      background:
                        "rgba(124,92,252,0.2)",
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                    }}
                  >
                    <Star
                      size={16}
                      color="#B8A9FD"
                      fill="#B8A9FD"
                    />
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                      }}
                    >
                      Weighted score
                    </div>

                    <div
                      style={{
                        fontSize: 12,
                        color:
                          "#5B5F6D",
                      }}
                    >
                      ({scoreString})
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems:
                      "center",
                    gap: 12,
                  }}
                >
                  <span
                    style={{
                      fontFamily:
                        "'Space Grotesk', sans-serif",
                      fontSize: 28,
                      fontWeight: 700,
                      color: "#8A6EFC",
                    }}
                  >
                    {weightedScore.toFixed(
                      2
                    )}

                    <span
                      style={{
                        fontSize: 15,
                        color:
                          "#5B5F6D",
                        fontWeight: 500,
                      }}
                    >
                      {" "}
                      / 5
                    </span>
                  </span>

                  <span
                    style={{
                      fontSize: 12.5,
                      fontWeight: 600,
                      padding:
                        "5px 12px",
                      borderRadius: 20,
                      background:
                        `${v.color}22`,
                      color:
                        v.color,
                    }}
                  >
                    {v.label}
                  </span>
                </div>
              </div>
            </Panel>

            {/* =================================================
                Comments
            ================================================= */}

            <Panel>
              <PanelHeading
                icon={MessageSquare}
                title="Judge comments"
              />

              {submitted ? (
                <div>
                  <div
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      gap: 10,
                      color:
                        "#4ADE80",
                      fontSize: 14,
                      fontWeight: 500,
                      marginBottom: 12,
                    }}
                  >
                    <Trophy size={16} />

                    Review saved for{" "}
                    {project?.title}.
                  </div>

                  <textarea
                    value={comment}
                    onChange={(e) =>
                      setComment(
                        e.target.value.slice(
                          0,
                          500
                        )
                      )
                    }
                    placeholder="Share feedback on what stood out and what could improve..."
                  />

                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                      marginTop: 12,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        color:
                          "#5B5F6D",
                      }}
                    >
                      {comment.length}/500
                    </span>

                    <button
                      onClick={
                        handleSubmit
                      }
                      disabled={
                        saving
                      }
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "center",
                        gap: 7,
                        background:
                          saving
                            ? "#3A354F"
                            : "linear-gradient(135deg, #8A6EFC, #6D4FE8)",
                        color:
                          "#FFFFFF",
                        border:
                          "none",
                        padding:
                          "10px 20px",
                        borderRadius: 9,
                        fontSize:
                          13.5,
                        fontWeight:
                          600,
                        cursor:
                          saving
                            ? "not-allowed"
                            : "pointer",
                        fontFamily:
                          "Inter, sans-serif",
                      }}
                    >
                      <Send size={13} />

                      {saving
                        ? "Saving..."
                        : "Update review"}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <textarea
                    value={comment}
                    onChange={(e) =>
                      setComment(
                        e.target.value.slice(
                          0,
                          500
                        )
                      )
                    }
                    placeholder="Share feedback on what stood out and what could improve..."
                  />

                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                      marginTop: 12,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        color:
                          "#5B5F6D",
                      }}
                    >
                      {comment.length}/500
                    </span>

                    <button
                      onClick={
                        handleSubmit
                      }
                      disabled={
                        saving
                      }
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "center",
                        gap: 7,
                        background:
                          saving
                            ? "#3A354F"
                            : "linear-gradient(135deg, #8A6EFC, #6D4FE8)",
                        color:
                          "#FFFFFF",
                        border:
                          "none",
                        padding:
                          "10px 20px",
                        borderRadius: 9,
                        fontSize:
                          13.5,
                        fontWeight:
                          600,
                        cursor:
                          saving
                            ? "not-allowed"
                            : "pointer",
                        fontFamily:
                          "Inter, sans-serif",
                      }}
                    >
                      <Send size={13} />

                      {saving
                        ? "Saving..."
                        : "Submit review"}
                    </button>
                  </div>
                </>
              )}
            </Panel>
          </div>

          {/* =================================================
              Sidebar
          ================================================= */}

          <div
            style={{
              display: "flex",
              flexDirection:
                "column",
              gap: 16,
            }}
          >
            {/* Team summary */}

            <Panel>
              <PanelHeading
                icon={Users}
                title="Team summary"
              />

              <div
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap: 12,
                  background:
                    "rgba(124,92,252,0.08)",
                  border:
                    "1px solid rgba(124,92,252,0.25)",
                  borderRadius: 10,
                  padding:
                    "12px 14px",
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background:
                      "linear-gradient(135deg, #4C3BCF, #7C5CFC)",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    flexShrink: 0,
                  }}
                >
                  <Shield
                    size={18}
                    color="#FFFFFF"
                  />
                </div>

                <div
                  style={{
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      overflow:
                        "hidden",
                      textOverflow:
                        "ellipsis",
                      whiteSpace:
                        "nowrap",
                    }}
                  >
                    {projectTeam.name}
                  </div>

                  <div
                    style={{
                      fontSize: 11.5,
                      color:
                        "#9A96AC",
                    }}
                  >
                    {projectTrack} Track
                  </div>
                </div>

                <span
                  style={{
                    marginLeft:
                      "auto",
                    fontFamily:
                      "'Space Grotesk', sans-serif",
                    fontSize: 16,
                    fontWeight: 700,
                    color:
                      "#8A6EFC",
                  }}
                >
                  {weightedScore.toFixed(
                    2
                  )}
                </span>
              </div>

              <InfoRow
                label="Track"
                value={
                  projectTrack
                }
              />

              <InfoRow
                label="Total members"
                value={
                  teamMembers.length
                }
              />

              <InfoRow
                label="Status"
                value={
                  submitted
                    ? "Scored"
                    : "Pending"
                }
                valueColor={
                  submitted
                    ? "#4ADE80"
                    : "#EAB308"
                }
              />

              <InfoRow
                label="Submitted on"
                value={formatSubmittedDate(
                  submittedAt
                )}
                last
              />
            </Panel>

            {/* Project links */}

            <Panel>
              <PanelHeading
                icon={ExternalLink}
                title="Project links"
              />

              {repoUrl ? (
                <a
                  className="project-link"
                  href={repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap: 10,
                    textDecoration:
                      "none",
                    border:
                      "1px solid #262A34",
                    borderRadius: 10,
                    padding:
                      "10px 12px",
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      background:
                        "#1D2029",
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      flexShrink: 0,
                    }}
                  >
                    <ExternalLink
                      size={16}
                      color="#B8A9FD"
                    />
                  </div>

                  <div
                    style={{
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color:
                          "#E8E6F0",
                      }}
                    >
                      Project repository
                    </div>

                    <div
                      style={{
                        fontSize: 11.5,
                        color:
                          "#5B5F6D",
                        overflow:
                          "hidden",
                        textOverflow:
                          "ellipsis",
                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      {repoUrl}
                    </div>
                  </div>

                  <ExternalLink
                    size={13}
                    color="#5B5F6D"
                    style={{
                      marginLeft:
                        "auto",
                      flexShrink: 0,
                    }}
                  />
                </a>
              ) : (
                <div
                  style={{
                    fontSize: 13,
                    color:
                      "#5B5F6D",
                  }}
                >
                  No repository URL
                  provided.
                </div>
              )}
            </Panel>

            {/* Team members */}

            <Panel>
              <PanelHeading
                icon={Users}
                title="Team members"
              />

              <div
                style={{
                  display:
                    "flex",
                  flexDirection:
                    "column",
                  gap: 12,
                }}
              >
                {teamMembers.length ===
                0 ? (
                  <div
                    style={{
                      fontSize: 13,
                      color:
                        "#5B5F6D",
                    }}
                  >
                    No team members
                    available.
                  </div>
                ) : (
                  teamMembers.map(
                    (member, index) => {
                      const memberName =
                        typeof member ===
                        "string"
                          ? member
                          : member?.name ||
                            member?.email ||
                            `Member ${
                              index + 1
                            }`;

                      return (
                        <div
                          key={
                            member?.id ||
                            member?.email ||
                            memberName
                          }
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap: 10,
                          }}
                        >
                          <div
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius:
                                "50%",
                              background:
                                "rgba(124,92,252,0.2)",
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              fontSize: 12,
                              fontWeight: 600,
                              color:
                                "#B8A9FD",
                              flexShrink: 0,
                            }}
                          >
                            {memberName[0]?.toUpperCase() ||
                              "M"}
                          </div>

                          <span
                            style={{
                              fontSize: 13,
                              color:
                                "#C7C4D6",
                              overflow:
                                "hidden",
                              textOverflow:
                                "ellipsis",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {memberName}
                          </span>
                        </div>
                      );
                    }
                  )
                )}
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   Score Stepper
------------------------------------------------------- */

function ScoreStepper({
  value,
  maxScore,
  onDec,
  onInc,
}) {
  const safeMax = Math.max(
    1,
    Number(maxScore || 5)
  );

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        border:
          "1px solid #262A34",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <button
        onClick={onDec}
        disabled={value <= 0}
        style={{
          width: 30,
          height: 30,
          background:
            "#14161C",
          border: "none",
          color:
            value <= 0
              ? "#30333D"
              : "#9A96AC",
          cursor:
            value <= 0
              ? "not-allowed"
              : "pointer",
          display: "flex",
          alignItems:
            "center",
          justifyContent:
            "center",
        }}
      >
        <Minus size={13} />
      </button>

      <div
        style={{
          width: 42,
          textAlign: "center",
          fontSize: 13.5,
          fontWeight: 600,
          color: "#E8E6F0",
        }}
      >
        {value}
      </div>

      <button
        onClick={onInc}
        disabled={value >= safeMax}
        style={{
          width: 30,
          height: 30,
          background:
            "#14161C",
          border: "none",
          color:
            value >= safeMax
              ? "#30333D"
              : "#9A96AC",
          cursor:
            value >= safeMax
              ? "not-allowed"
              : "pointer",
          display: "flex",
          alignItems:
            "center",
          justifyContent:
            "center",
        }}
      >
        <Plus size={13} />
      </button>
    </div>
  );
}

/* -------------------------------------------------------
   Quick link
------------------------------------------------------- */

function QuickLink({
  icon: Icon,
  label,
  href,
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        textDecoration: "none",
        color: "#B8A9FD",
        fontSize: 13.5,
        fontWeight: 500,
      }}
    >
      <Icon size={14} />

      {label}

      <ExternalLink
        size={12}
        style={{
          marginLeft: "auto",
        }}
      />
    </a>
  );
}

/* -------------------------------------------------------
   Panel
------------------------------------------------------- */

function Panel({ children }) {
  return (
    <div
      style={{
        background: "#14161C",
        border:
          "1px solid #1D2029",
        borderRadius: 14,
        padding: "22px",
        marginBottom: 20,
      }}
    >
      {children}
    </div>
  );
}

/* -------------------------------------------------------
   Panel heading
------------------------------------------------------- */

function PanelHeading({
  icon: Icon,
  title,
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 16,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background:
            "rgba(124,92,252,0.15)",
          display: "flex",
          alignItems:
            "center",
          justifyContent:
            "center",
          flexShrink: 0,
        }}
      >
        <Icon
          size={14}
          color="#B8A9FD"
        />
      </div>

      <h3
        style={{
          fontFamily:
            "'Space Grotesk', sans-serif",
          fontSize: 15.5,
          fontWeight: 600,
          margin: 0,
        }}
      >
        {title}
      </h3>
    </div>
  );
}

/* -------------------------------------------------------
   Info row
------------------------------------------------------- */

function InfoRow({
  label,
  value,
  valueColor,
  last,
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent:
          "space-between",
        gap: 20,
        padding: "10px 0",
        borderBottom: last
          ? "none"
          : "1px solid #1D2029",
      }}
    >
      <span
        style={{
          fontSize: 13,
          color: "#5B5F6D",
        }}
      >
        {label}
      </span>

      <span
        style={{
          fontSize: 13,
          fontWeight: 600,
          color:
            valueColor ||
            "#E8E6F0",
          textAlign: "right",
        }}
      >
        {value}
      </span>
    </div>
  );
}