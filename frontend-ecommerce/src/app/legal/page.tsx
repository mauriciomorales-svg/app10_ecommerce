import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SOFWARE MAURICIO MORALES ENERGY SYSTEMS E.I.R.L.',
  description:
    'Ingeniería, software y sistemas de energía. Información corporativa y legal para validación de Meta Business Manager.',
};

const legalName = 'SOFWARE MAURICIO MORALES ENERGY SYSTEMS E.I.R.L.';
const rut = '78.301.789-K';
const address = 'Santiago Watt 205, Comuna de Renaico, Región de la Araucanía, Chile.';
const email = 'mauricio.morales@usach.cl';
const phone = '+56 9 3893 8614';

export default function LegalPage() {
  return (
    <main className="min-h-screen bg-white text-[#1A365D]">
      <header className="border-b border-[#4A5568]/20 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
          <a href="#inicio" className="text-sm font-bold tracking-wide text-[#1A365D] sm:text-base">
            {legalName}
          </a>
          <nav className="flex items-center gap-4 text-sm font-medium text-[#4A5568]">
            <a href="#inicio" className="hover:text-[#1A365D]">
              Inicio
            </a>
            <a href="#servicios" className="hover:text-[#1A365D]">
              Servicios
            </a>
            <a href="#legal" className="hover:text-[#1A365D]">
              Legal
            </a>
          </nav>
        </div>
      </header>

      <section id="inicio" className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#4A5568]">Ingeniería y Tecnología</p>
        <h1 className="mt-3 text-3xl font-bold leading-tight text-[#1A365D] sm:text-4xl">
          {legalName}
        </h1>
        <p className="mt-6 max-w-3xl text-base leading-relaxed text-[#4A5568] sm:text-lg">
          Empresa especializada en soluciones de ingeniería, desarrollo de software y sistemas de energía para
          operaciones comerciales e industriales. Diseñamos e implementamos plataformas de alta disponibilidad,
          integración de pagos, automatización operativa y trazabilidad digital.
        </p>
      </section>

      <section id="servicios" className="border-y border-[#4A5568]/20 bg-[#F7FAFC]">
        <div className="mx-auto w-full max-w-6xl px-6 py-14 sm:py-16">
          <h2 className="text-2xl font-bold text-[#1A365D] sm:text-3xl">Sobre Nosotros</h2>
          <p className="mt-4 max-w-4xl text-base leading-relaxed text-[#4A5568]">
            SOFWARE MAURICIO MORALES ENERGY SYSTEMS E.I.R.L. presta servicios profesionales de ingeniería,
            arquitectura de software, automatización de procesos y sistemas de energía, con enfoque en cumplimiento,
            continuidad operacional y soluciones tecnológicas para empresas.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <article className="rounded-xl border border-[#4A5568]/20 bg-white p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[#1A365D]">Ingeniería</h3>
              <p className="mt-2 text-sm text-[#4A5568]">Diseño de soluciones técnicas para operación y escalamiento.</p>
            </article>
            <article className="rounded-xl border border-[#4A5568]/20 bg-white p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[#1A365D]">Software</h3>
              <p className="mt-2 text-sm text-[#4A5568]">
                Desarrollo e integración de plataformas web, API y sistemas transaccionales.
              </p>
            </article>
            <article className="rounded-xl border border-[#4A5568]/20 bg-white p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[#1A365D]">Energy Systems</h3>
              <p className="mt-2 text-sm text-[#4A5568]">
                Implementación de sistemas de soporte energético y continuidad operativa.
              </p>
            </article>
          </div>
        </div>
      </section>

      <footer id="legal" className="mx-auto w-full max-w-6xl px-6 py-14 sm:py-16">
        <h2 className="text-2xl font-bold text-[#1A365D] sm:text-3xl">Legal</h2>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <section className="rounded-xl border border-[#4A5568]/20 p-6">
            <h3 className="text-lg font-semibold text-[#1A365D]">Política de Privacidad</h3>
            <p className="mt-3 text-sm leading-relaxed text-[#4A5568]">
              SOFWARE MAURICIO MORALES ENERGY SYSTEMS E.I.R.L. protege los datos personales de sus clientes,
              proveedores y usuarios conforme a la normativa aplicable en Chile. Los datos recolectados se utilizan
              exclusivamente para fines de contacto, prestación de servicios, soporte técnico, facturación y mejora de
              procesos. No comercializamos datos personales con terceros. Toda solicitud de actualización, rectificación
              o eliminación de datos puede gestionarse a través del correo corporativo informado en esta página.
            </p>
          </section>

          <section className="rounded-xl border border-[#4A5568]/20 p-6">
            <h3 className="text-lg font-semibold text-[#1A365D]">Términos y Condiciones de Servicio</h3>
            <p className="mt-3 text-sm leading-relaxed text-[#4A5568]">
              Los servicios ofrecidos por SOFWARE MAURICIO MORALES ENERGY SYSTEMS E.I.R.L. se entregan bajo acuerdo
              comercial entre las partes, incluyendo alcance, plazos, soporte y responsabilidades. El uso de
              plataformas y soluciones implementadas debe ajustarse a la legislación vigente y a las condiciones
              contractuales pactadas. La empresa se reserva el derecho de actualizar características técnicas y
              operativas para mantener seguridad, continuidad y cumplimiento normativo.
            </p>
          </section>
        </div>

        <section className="mt-8 rounded-xl border border-[#4A5568]/20 p-6">
          <h3 className="text-lg font-semibold text-[#1A365D]">Información de la Empresa</h3>
          <dl className="mt-4 space-y-3 text-sm text-[#4A5568]">
            <div>
              <dt className="font-semibold text-[#1A365D]">Razón Social</dt>
              <dd>{legalName}</dd>
            </div>
            <div>
              <dt className="font-semibold text-[#1A365D]">RUT</dt>
              <dd>{rut}</dd>
            </div>
            <div>
              <dt className="font-semibold text-[#1A365D]">Dirección</dt>
              <dd>{address}</dd>
            </div>
            <div>
              <dt className="font-semibold text-[#1A365D]">Email de Contacto</dt>
              <dd>
                <a href={`mailto:${email}`} className="font-medium text-[#1A365D] underline underline-offset-2">
                  {email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-[#1A365D]">Teléfono</dt>
              <dd>
                <a href="tel:+56938938614" className="font-medium text-[#1A365D] underline underline-offset-2">
                  {phone}
                </a>
              </dd>
            </div>
          </dl>
        </section>
      </footer>
    </main>
  );
}
