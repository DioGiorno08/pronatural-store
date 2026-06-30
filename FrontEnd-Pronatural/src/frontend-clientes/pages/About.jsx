export default function About() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-brand-bg flex flex-col lg:flex-row py-12 px-12 lg:py-24 lg:px-32 gap-16 lg:gap-32">
      <div className="w-full lg:w-1/2">
        <div className="relative h-[500px] lg:h-[800px] w-full bg-gray-200">
          <img src="https://images.unsplash.com/photo-1599570183057-0a30b42f38d3?q=80&w=1200&auto=format&fit=crop" alt="Tractor in field" className="absolute inset-0 w-full h-full object-cover shadow-sm" />
        </div>
      </div>
      <div className="w-full lg:w-1/2 lg:pt-16">
        <h1 className="text-[56px] lg:text-[72px] font-bold tracking-tighter text-[#0a2016] mb-16">NOSOTROS</h1>
        <div className="text-[17px] text-brand-dark leading-[1.8] space-y-8 max-w-xl">
          <p className="font-medium text-gray-700">
            Somos una empresa familiar preocupada por la nutrición ortomolecular de las personas para mejorar la calidad de vida.
          </p>
          <div className="pl-8 border-l-[3px] border-[#b45309] py-3 my-12">
            <p className="text-[#b45309] font-semibold italic text-[18px] leading-[1.7]">
              Ofrecemos productos naturales elaborados con altos estándares de calidad a base de plantas y minerales naturales que ayuden a alcalinizar el cuerpo y mejorar la salud, creando una revolución cultural de hábitos saludables para obtener una verdadera calidad de vida siendo preventivos en salud y de esta forma aportar mayor productividad laboral y profesional.
            </p>
          </div>
          <p className="text-gray-600">
            Pro-Natural, actualmente cuenta con plantaciones de noni, moringa, café; colmenas. Además, distribuimos productos que aportan minerales al cuerpo como la sal marina virgen, bicarbonato de sodio, agua de mar entre otros.
          </p>
        </div>
      </div>
    </div>
  );
}
