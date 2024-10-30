import React from 'react';

type Language = 'zh' | 'en' | 'ja' | 'ko' | 'de' | 'fr';

type ErrorCode =
  | `-1000${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`
  | '-10010'
  | '-10011'
  | '-10012'
  | '-1024';

type ErrorCodeOrDefault = ErrorCode | 'default';

type ErrorMessageFn = (param: React.ReactNode) => React.ReactNode;

type ErrorMessages = {
  [K in ErrorCodeOrDefault]: ErrorMessageFn;
};

type LanguageSpecificText = {
  reloginText: string;
  unknownErrorText: string;
};

const languageTexts: Record<Language, LanguageSpecificText> = {
  zh: { reloginText: '重新登录', unknownErrorText: '未知错误' },
  en: { reloginText: 'log in again', unknownErrorText: 'Unknown Error' },
  ja: { reloginText: '再ログイン', unknownErrorText: '不明なエラー' },
  ko: { reloginText: '로그인 다시', unknownErrorText: '알 수 없는 오류' },
  de: {
    reloginText: 'Erneut anmelden',
    unknownErrorText: 'Unbekannter Fehler',
  },
  fr: { reloginText: 'Se reconnecter', unknownErrorText: 'Erreur inconnue' },
};

const createReloginLink = (lang: Language) => (
  <a
    className="underline"
    href="/auth"
    rel="noreferrer"
    style={{ color: '#0070f0' }}
    target="_blank"
  >
    {languageTexts[lang].reloginText}
  </a>
);

const createGwLink = (region: number) => (
  <a
    className="underline"
    href={region ? 'https://302.ai/' : 'https://302ai.cn/'}
    rel="noreferrer"
    style={{ color: '#0070f0' }}
    target="_blank"
  >
    302.AI
  </a>
);

const errorMessages: Record<Language, ErrorMessages> = {
  zh: {
    '-10001': () => <>缺少 302 API 密钥</>,
    '-10002': (gw) => <>该工具已禁用/删除，更多请访问 {gw}</>,
    '-10003': () => <>网络错误，请稍后重试</>,
    '-10004': (gw) => <>账户余额不足，创建属于自己的工具，更多请访问 {gw}</>,
    '-10005': (relogin) => <>账户凭证过期，请 {relogin}</>,
    '-10006': (gw) => <>账户总额度已达上限，更多请访问 {gw}</>,
    '-10007': (gw) => <>账户日额度已达上限，更多请访问 {gw}</>,
    '-10008': (gw) => <>当前无可用通道，更多请访问 {gw}</>,
    '-10009': (gw) => <>不支持当前API功能，更多请访问 {gw}</>,
    '-10010': (gw) => <>未能找到资源，更多请访问 {gw}</>,
    '-10011': () => <>无效的请求</>,
    '-10012': (gw) => (
      <>该免费工具在本小时的额度已达上限，请访问 {gw} 生成属于自己的工具</>
    ),
    '-1024': (gw) => <>AI接口连接超时， 请稍后重试或者联系 {gw}</>,
    default: (gw) => <>未知错误，更多请访问 {gw}</>,
  },
  en: {
    '-10001': () => <>Missing 302 Apikey</>,
    '-10002': (gw) => (
      <>This tool has been disabled/deleted, for details please view {gw}</>
    ),
    '-10003': () => <>Network error, please try again later</>,
    '-10004': (gw) => (
      <>
        Insufficient account balance. Create your own tool, for details please
        view {gw}
      </>
    ),
    '-10005': () => <>Account credential expired, please log in again</>,
    '-10006': (gw) => (
      <>Total Quota reached maximum limit, for details please view {gw}</>
    ),
    '-10007': (gw) => (
      <>Daily Quota reached maximum limit, for details please view {gw}</>
    ),
    '-10008': (gw) => (
      <>No available channels currently, for details please view {gw}</>
    ),
    '-10009': (gw) => (
      <>Current API function not supported, for details please view {gw}</>
    ),
    '-10010': (gw) => <>Resource not found, for details please view {gw}</>,
    '-10011': () => <>Invalid request</>,
    '-10012': (gw) => (
      <>
        This free tool&apos;s hour quota reached maximum limit. Please view {gw}
        to create your own tool
      </>
    ),
    '-1024': (gw) => (
      <>
        AI interface connection timeout, please try again later or contact {gw}
      </>
    ),
    default: (gw) => <>Unknown error, for details please view {gw}</>,
  },
  ja: {
    '-10001': () => <>302 APIキーがありません</>,
    '-10002': (gw) => (
      <>このツールは無効化/削除されています。詳細は{gw}をご覧ください。</>
    ),
    '-10003': () => <>ネットワークエラー、後でもう一度お試しください。</>,
    '-10004': (gw) => (
      <>
        アカウント残高が不足しています。独自のツールを作成するには、{gw}{' '}
        をご覧ください。
      </>
    ),
    '-10005': () => (
      <>アカウントの資格情報が期限切れです。再度ログインしてください。</>
    ),
    '-10006': (gw) => (
      <>アカウントの総限度額に達しました。詳細は{gw}をご覧ください。</>
    ),
    '-10007': (gw) => (
      <>アカウントの日次限度額に達しました。詳細は{gw}をご覧ください。</>
    ),
    '-10008': (gw) => (
      <>現在利用可能なチャネルはありません。詳細は{gw}をご覧ください。</>
    ),
    '-10009': (gw) => (
      <>現在のAPI機能はサポートされていません。詳細は{gw}をご覧ください。</>
    ),
    '-10010': (gw) => (
      <>リソースが見つかりませんでした。詳細は{gw}をご覧ください。</>
    ),
    '-10011': () => <>無効なリクエスト</>,
    '-10012': (gw) => (
      <>
        この無料ツールは今時間の上限に達しました。{gw}{' '}
        を訪問して自分のツールを作成してください
      </>
    ),
    '-1024': (gw) => (
      <>
        AIインターフェース接続がタイムアウトしました。しばらくしてから再試行するか、
        {gw}に連絡してください。
      </>
    ),
    default: (gw) => <>不明なエラー、詳細は{gw}をご覧ください。</>,
  },
  ko: {
    '-10001': (relogin) => <>302 API 키가 없습니다, 다시 {relogin}하세요</>,
    '-10002': (gw) => (
      <>이 도구가 비활성화/삭제되었습니다, 자세한 내용은 {gw}에서 확인하세요</>
    ),
    '-10003': () => <>네트워크 오류입니다. 나중에 다시 시도하십시오.</>,
    '-10004': (gw) => (
      <>계정 잔액이 부족합니다. 더 많은 정보를 얻으려면 {gw}를 확인하세요</>
    ),
    '-10005': (relogin) => (
      <>계정 자격이 만료되었습니다, 다시 {relogin}하세요</>
    ),
    '-10006': (gw) => (
      <>
        계정 총 한도에 도달했습니다, 더 많은 정보를 원하시면 {gw}를 확인하세요
      </>
    ),
    '-10007': (gw) => (
      <>
        계정의 하루 한도에 도달했습니다, 더 많은 정보를 원하면 {gw}를 확인하세요
      </>
    ),
    '-10008': (gw) => (
      <>
        현재 사용 가능한 통로가 없습니다, 더 많은 정보를 원하면 {gw}를
        확인하세요
      </>
    ),
    '-10009': (gw) => (
      <>현재 API 기능이 지원되지 않습니다, 자세한 내용은 {gw}에서 확인하세요</>
    ),
    '-10010': (gw) => (
      <>리소스를 찾을 수 없습니다, 자세한 내용은 {gw}에서 확인하세요</>
    ),
    '-10011': () => <>잘못된 요청</>,
    '-10012': (gw) => (
      <>
        무료 도구의 시간 한도에 도달했습니다. 더 많은 정보를 원하면 {gw}를
        확인하세요
      </>
    ),
    '-1024': (gw) => (
      <>
        AI 인터페이스 연결 시간이 초과되었습니다. 나중에 다시 시도하십시오 또는{' '}
        {gw}에 연락하십시오
      </>
    ),
    default: (gw) => <>알 수없는 오류, 자세한 내용은 {gw}에서 확인하십시오</>,
  },
  de: {
    '-10001': (relogin) => <>Fehlende 302 API-Schlüssel, bitte {relogin}</>,
    '-10002': (gw) => (
      <>
        Dieses Tool wurde deaktiviert/gelöscht, weitere Informationen finden Sie
        bei {gw}
      </>
    ),
    '-10003': () => <>Netzwerkfehler, bitte versuchen Sie es später erneut</>,
    '-10004': (gw) => (
      <>
        Unzureichendes Kontoguthaben, erstellen Sie Ihr eigenes Tool, für
        Details besuchen Sie {gw}
      </>
    ),
    '-10005': (relogin) => <>Kontozertifikate abgelaufen, bitte {relogin}</>,
    '-10006': (gw) => (
      <>
        Die Gesamtkapazität des Kontos hat das Maximum erreicht, weitere
        Informationen finden Sie bei {gw}
      </>
    ),
    '-10007': (gw) => (
      <>
        Das tägliche Kontingent des Kontos hat das Maximum erreicht, weitere
        Informationen finden Sie bei {gw}
      </>
    ),
    '-10008': (gw) => (
      <>
        Derzeit keine Kanäle verfügbar, weitere Informationen finden Sie bei{' '}
        {gw}
      </>
    ),
    '-10009': (gw) => (
      <>
        Die API-Funktion wird derzeit nicht unterstützt, weitere Informationen
        finden Sie bei {gw}
      </>
    ),
    '-10010': (gw) => (
      <>Ressource nicht gefunden, weitere Informationen finden Sie bei {gw}</>
    ),
    '-10011': () => <>Ungültige Anforderung</>,
    '-10012': (gw) => (
      <>
        Dieses kostenlose Tool hat das Stundenkontingent erreicht. Erstellen Sie
        Ihr eigenes Tool unter {gw}
      </>
    ),
    '-1024': (gw) => (
      <>
        Zeitüberschreitung bei der AI-Schnittstelle, bitte versuchen Sie es
        später erneut oder kontaktieren Sie {gw}
      </>
    ),
    default: (gw) => (
      <>Unbekannter Fehler, weitere Informationen finden Sie bei {gw}</>
    ),
  },
  fr: {
    '-10001': (relogin) => <>302 API-Clé manquante, veuillez {relogin}</>,
    '-10002': (gw) => (
      <>
        Cet outil a été désactivé/supprimé, pour plus de détails, veuillez
        consulter {gw}
      </>
    ),
    '-10003': () => <>Erreur réseau, veuillez réessayer plus tard</>,
    '-10004': (gw) => (
      <>
        Solde de compte insuffisant, créez votre propre outil, pour plus de
        détails, consultez {gw}
      </>
    ),
    '-10005': (relogin) => (
      <>Les identifiants de votre compte ont expiré, veuillez {relogin}</>
    ),
    '-10006': (gw) => (
      <>
        Le quota total du compte a atteint la limite maximale, pour plus de
        détails, consultez {gw}
      </>
    ),
    '-10007': (gw) => (
      <>
        Le quota quotidien du compte a atteint la limite maximale, pour plus de
        détails, consultez {gw}
      </>
    ),
    '-10008': (gw) => (
      <>
        Aucun canal disponible actuellement, pour plus de détails, consultez{' '}
        {gw}
      </>
    ),
    '-10009': (gw) => (
      <>
        Fonctionnalité API non prise en charge actuellement, pour plus de
        détails, consultez {gw}
      </>
    ),
    '-10010': (gw) => (
      <>Ressource introuvable, pour plus de détails, consultez {gw}</>
    ),
    '-10011': () => <>Demande invalide</>,
    '-10012': (gw) => (
      <>
        Ce quota horaire gratuit a atteint sa limite. Créez votre propre outil à
        l&apos;adresse {gw}
      </>
    ),
    '-1024': (gw) => (
      <>
        Délai d&apos;expiration de la connexion AI, veuillez réessayer plus tard
        ou contacter {gw}
      </>
    ),
    default: (gw) => (
      <>Erreur inconnue, veuillez consulter {gw} pour plus de détails</>
    ),
  },
};

export function ErrMessage(
  err_code: number,
  lang: Language,
  region: number
): React.ReactNode {
  const errorCode = `${err_code}` as ErrorCodeOrDefault;
  const relogin = createReloginLink(lang);
  const gw = createGwLink(region);

  const getMessage = (code: ErrorCodeOrDefault) => {
    const messageFn =
      errorMessages[lang][code] || errorMessages[lang]['default'];

    return messageFn(code === '-10001' || code === '-10005' ? relogin : gw);
  };

  return <div className="font-bold">{getMessage(errorCode)}</div>;
}
