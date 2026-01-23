export const metadata = {
    title: "Termos de Uso | RevenueOS",
    description: "Legal e Termos de Serviço do RevenueOS."
};

export default function TermsOfUse() {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-900">
            <div className="bg-slate-50 border-b border-slate-200 py-20">
                <div className="container mx-auto px-4 max-w-3xl text-center">
                    <h1 className="text-4xl font-bold mb-4">Termos de Uso</h1>
                    <p className="text-slate-500 text-lg">Última atualização: 21 de Fevereiro de 2026</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16 max-w-3xl prose prose-slate prose-lg">
                <h2>1. Aceitação dos Termos</h2>
                <p>
                    Ao acessar e usar a plataforma RevenueOS ("Serviço"), você concorda em cumprir estes Termos de Uso.
                    Se você não concordar com algum destes termos, você está proibido de usar ou acessar este site.
                </p>

                <h2>2. Uso da Licença</h2>
                <p>
                    É concedida permissão para baixar temporariamente uma cópia dos materiais (informações ou software) no site da RevenueOS,
                    apenas para visualização transitória pessoal e não comercial.
                </p>

                <h2>3. Isenção de Responsabilidade</h2>
                <p>
                    Os materiais no site da RevenueOS são fornecidos "como estão". A RevenueOS não oferece garantias, expressas ou implícitas,
                    e, por este meio, isenta e nega todas as outras garantias, incluindo, sem limitação, garantias implícitas ou condições de
                    comercialização, adequação a um fim específico ou não violação de propriedade intelectual.
                </p>

                <h2>4. Limitações</h2>
                <p>
                    Em nenhum caso a RevenueOS ou seus fornecedores serão responsáveis por quaisquer danos (incluindo, sem limitação, danos por perda de dados
                    ou lucro ou devido a interrupção dos negócios) decorrentes do uso ou da incapacidade de usar os materiais da RevenueOS.
                </p>
            </div>
        </div>
    );
}
