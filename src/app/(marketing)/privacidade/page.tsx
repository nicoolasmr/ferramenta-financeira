export const metadata = {
    title: "Política de Privacidade | RevenueOS",
    description: "Como tratamos e protegemos seus dados."
};

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-900">
            <div className="bg-slate-50 border-b border-slate-200 py-20">
                <div className="container mx-auto px-4 max-w-3xl text-center">
                    <h1 className="text-4xl font-bold mb-4">Política de Privacidade</h1>
                    <p className="text-slate-500 text-lg">Última atualização: 21 de Fevereiro de 2026</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16 max-w-3xl prose prose-slate prose-lg">
                <h2>1. Coleta de Dados</h2>
                <p>
                    Coletamos informações que você nos fornece diretamente (e.g., ao criar uma conta, solicitar suporte)
                    e dados de uso coletados automaticamente quando você interage com nossos serviços.
                </p>

                <h2>2. Uso das Informações</h2>
                <p>
                    Utilizamos seus dados para:
                </p>
                <ul>
                    <li>Fornecer, manter e melhorar nossos serviços;</li>
                    <li>Processar transações e enviar avisos relacionados;</li>
                    <li>Responder a comentários, perguntas e solicitações de suporte;</li>
                    <li>Enviar comunicados técnicos, atualizações de segurança e alertas administrativos.</li>
                </ul>

                <h2>3. Compartilhamento de Dados</h2>
                <p>
                    Não vendemos seus dados pessoais. Compartilhamos informações apenas com terceiros que nos ajudam a operar
                    nossos serviços (como processadores de pagamento e provedores de nuvem), sob estritos acordos de confidencialidade.
                </p>

                <h2>4. Segurança</h2>
                <p>
                    Implementamos medidas de segurança técnicas e organizacionais (como criptografia e RLS) para proteger seus dados
                    contra acesso não autorizado, alteração ou destruição.
                </p>
            </div>
        </div>
    );
}
