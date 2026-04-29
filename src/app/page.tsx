import Link from "next/link";

export default function Home() {
  return (
    <main className="page-container">
      <section className="hero">
        <h1 className="hero-title">
          <span className="hero-gradient">MedLab Manager</span>
        </h1>
        <p className="hero-subtitle">
          Manage your medical laboratory data — units of measure, test categories, and medical tests — all in one place.
        </p>
      </section>

      <div className="cards-grid">
        <Link href="/uom" className="dashboard-card" id="card-uom">
          <div className="card-icon card-icon-uom">📏</div>
          <h2 className="card-title">Units of Measure</h2>
          <p className="card-desc">
            Manage measurement units like mg/dL, g/dL, IU/L and more. Define how test results are quantified.
          </p>
          <span className="card-arrow">Manage UOM →</span>
        </Link>

        <Link href="/categories" className="dashboard-card" id="card-categories">
          <div className="card-icon card-icon-category">🏷️</div>
          <h2 className="card-title">Test Categories</h2>
          <p className="card-desc">
            Organize tests into categories such as Blood Glucose Test (BCT), Complete Blood Count (CBC), and more.
          </p>
          <span className="card-arrow">Manage Categories →</span>
        </Link>

        <Link href="/medical-tests" className="dashboard-card" id="card-medical-tests">
          <div className="card-icon card-icon-test">🧪</div>
          <h2 className="card-title">Medical Tests</h2>
          <p className="card-desc">
            Full CRUD management of medical tests with linked categories, units, and normal value ranges.
          </p>
          <span className="card-arrow">Manage Tests →</span>
        </Link>
      </div>
    </main>
  );
}
