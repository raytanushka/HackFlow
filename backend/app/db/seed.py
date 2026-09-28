import json
import os
from datetime import datetime
from backend.app.db.database import Base, engine, SessionLocal
from backend.app.models.user import User
from backend.app.models.event import Event
from backend.app.models.track import Track
from backend.app.models.team import Team
from backend.app.models.team_member import TeamMember
from backend.app.models.project import Project
from backend.app.models.score import Score
from backend.app.models.session import Session

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        existing_event = db.query(Event).filter(Event.id == "evt_01").first()
        
        fixture_path = os.path.join("data", "fixtures.json")
        if not os.path.exists(fixture_path):
            fixture_path = os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "fixtures.json")
        
        with open(fixture_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        if not existing_event:
            print("Seeding database from data/fixtures.json...")
            
            evt_data = data.get("event", {})
            sub_close_str = evt_data["submissions_close"].replace("Z", "+00:00")
            sub_close = datetime.fromisoformat(sub_close_str)
            
            event = Event(
                id=evt_data["id"],
                name=evt_data["name"],
                description="Sample Hackathon 2026",
                submissions_close=sub_close,
                organizer_id="usr_organizer"
            )
            db.add(event)

            for trk in data.get("tracks", []):
                track = Track(id=trk["id"], event_id=evt_data["id"], name=trk["name"])
                db.add(track)

            for jdg in data.get("judges", []):
                user = User(
                    id=jdg["id"],
                    name=jdg["name"],
                    email=jdg["email"],
                    role="judge"
                )
                db.add(user)

            for tm in data.get("teams", []):
                team = Team(id=tm["id"], event_id=evt_data["id"], name=tm["name"])
                db.add(team)
                for member_email in tm.get("members", []):
                    tm_member = TeamMember(team_id=tm["id"], user_email=member_email)
                    db.add(tm_member)

            for prj in data.get("projects", []):
                sub_at_str = prj["submitted_at"].replace("Z", "+00:00")
                sub_at = datetime.fromisoformat(sub_at_str)
                project = Project(
                    id=prj["id"],
                    event_id=evt_data["id"],
                    team_id=prj["team"],
                    track_id=prj["track"],
                    title=prj["title"],
                    summary=prj["summary"],
                    repo_url=prj.get("repo_url"),
                    submitted_at=sub_at
                )
                db.add(project)

            for sc in data.get("scores", []):
                crit = sc.get("criteria", {})
                score = Score(
                    judge_id=sc["judge"],
                    project_id=sc["project"],
                    functionality=crit.get("functionality", 0),
                    quality=crit.get("quality", 0),
                    innovation=crit.get("innovation", 0),
                    comment=sc.get("comment", "")
                )
                db.add(score)

            db.commit()
            print("Fixture data seeded successfully.")

        acceptance_credentials = [
            ("usr_organizer", "organizer@example.org", "Organizer Admin", "organizer", "org_01", "session_org_hackflow_2026_token"),
            ("jdg_08", "marek.nowak@example.org", "Marek Nowak", "judge", None, "session_jdg_a_hackflow_2026_token"),
            ("jdg_03", "priya.nair@example.org", "Priya Nair", "judge", None, "session_jdg_b_hackflow_2026_token"),
            ("usr_participant", "priya1@example.org", "Participant User", "participant", None, "session_prt_hackflow_2026_token"),
        ]

        for uid, email, name, role, org_id, token in acceptance_credentials:
            existing_user = db.query(User).filter(User.id == uid).first()
            if not existing_user:
                existing_user = db.query(User).filter(User.email == email).first()
            
            if not existing_user:
                new_user = User(id=uid, name=name, email=email, role=role, org_id=org_id)
                db.add(new_user)
            
            existing_session = db.query(Session).filter(Session.token == token).first()
            if not existing_session:
                new_session = Session(token=token, user_id=uid, role=role)
                db.add(new_session)

        db.commit()

        # Seed open live/demo event: Smart Hack 2027 (clearly separated from fixtures.json)
        demo_event_id = "evt_smart_hack_2027"
        existing_demo = db.query(Event).filter(Event.id == demo_event_id).first()
        if not existing_demo:
            demo_event = Event(
                id=demo_event_id,
                name="Smart Hack 2027",
                description="Open Innovation Hackathon 2027 - Build the future of software and intelligence.",
                submissions_close=datetime(2027, 3, 3, 18, 0, 0),
                organizer_id="usr_organizer"
            )
            db.add(demo_event)

            demo_tracks = [
                "Developer tools", "Data and analytics", "Accessibility", 
                "Security", "Climate", "Health", "Education", "Open hardware"
            ]
            for idx, trk_name in enumerate(demo_tracks, 1):
                db.add(Track(
                    id=f"trk_sh_{idx:02d}",
                    event_id=demo_event_id,
                    name=trk_name
                ))
            db.commit()
            print("Demo event 'Smart Hack 2027' seeded successfully.")

        # Seed FinTech Buildathon
        fintech_event_id = "evt_fintech"
        existing_fintech = db.query(Event).filter(Event.id == fintech_event_id).first()
        if not existing_fintech:
            fintech_event = Event(
                id=fintech_event_id,
                name="FinTech Buildathon",
                description="Build solutions for a smarter, safer and more inclusive financial future.",
                submissions_close=datetime(2027, 10, 12, 18, 0, 0),
                organizer_id="usr_organizer"
            )
            db.add(fintech_event)

            fintech_tracks = ["FinTech", "Web", "Mobile", "Security", "Payments"]
            for idx, trk_name in enumerate(fintech_tracks, 1):
                db.add(Track(
                    id=f"trk_ft_{idx:02d}",
                    event_id=fintech_event_id,
                    name=trk_name
                ))
            db.commit()
            print("Event 'FinTech Buildathon' seeded successfully.")

        print("\n==================================================")
        print("DOGFOOD 2026 SEEDED ACCEPTANCE CREDENTIALS")
        print("==================================================")
        print("[auth]")
        print('organizer   = "Cookie: session=session_org_hackflow_2026_token"')
        print('judge_a     = "Cookie: session=session_jdg_a_hackflow_2026_token"')
        print('judge_b     = "Cookie: session=session_jdg_b_hackflow_2026_token"')
        print('participant = "Cookie: session=session_prt_hackflow_2026_token"')
        print("==================================================\n")

    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
