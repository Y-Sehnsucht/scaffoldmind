export function AnalysisPanel({ analysis, deepDive, diagnosis, userAnswer, onUserAnswerChange, onOpenPage, onDeepDive, onDiagnose }) {
  if (!analysis) {
    return (
      <section className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">等待生成学习闭环</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
          在左侧输入材料并点击生成后，这里会展示结构化解析、主动追问、用户尝试、错误诊断、强化题和 Obsidian 输出。
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <article className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-teal-700">PPT 第 {analysis.pageNumber} 页</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-950">{analysis.topic}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{analysis.summary}</p>
          </div>
          <button
            className="rounded-md border border-teal-200 px-3 py-2 text-sm font-medium text-teal-800 transition hover:bg-teal-50"
            type="button"
            onClick={onOpenPage}
          >
            查看第 {analysis.pageNumber} 页原始内容
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {analysis.coreConcepts.map((concept) => (
            <div key={concept.name} className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <h3 className="font-semibold text-slate-950">{concept.name}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{concept.simpleExplanation}</p>
              <p className="mt-2 text-sm leading-6 text-slate-800">本质：{concept.essence}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {concept.relatedConcepts.map((item) => (
                  <span key={item} className="rounded-full bg-white px-2 py-1 text-xs text-slate-600">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </article>

      <InfoGrid analysis={analysis} />

      <article className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-950">主动追问</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {analysis.guidedQuestions.map((question) => (
            <button
              key={question.id}
              className="rounded-md border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-teal-300 hover:bg-teal-50"
              type="button"
              onClick={() => onDeepDive(question)}
            >
              <span className="rounded bg-teal-100 px-2 py-1 text-xs font-medium text-teal-800">
                {question.typeLabel}
              </span>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-950">{question.question}</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">{question.reason}</p>
            </button>
          ))}
        </div>
      </article>

      {deepDive ? (
        <article className="rounded-md border border-teal-200 bg-teal-50 p-5 shadow-sm">
          <h3 className="text-base font-semibold text-teal-950">mock 深入回答</h3>
          <p className="mt-2 text-sm leading-6 text-teal-950">{deepDive.answer}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {deepDive.keyPoints.map((point) => (
              <span key={point} className="rounded-full bg-white px-2 py-1 text-xs text-teal-800">
                {point}
              </span>
            ))}
          </div>
        </article>
      ) : null}

      <article className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-950">用户尝试</h3>
        <p className="mt-2 text-sm leading-6 text-slate-700">{analysis.userTask.question}</p>
        <textarea
          className="mt-3 min-h-24 w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm leading-6 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          value={userAnswer}
          onChange={(event) => onUserAnswerChange(event.target.value)}
          placeholder="写下你的解释，再让 mock 诊断指出偏差"
        />
        <button
          className="mt-3 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          type="button"
          onClick={onDiagnose}
        >
          提交回答并诊断
        </button>
      </article>

      {diagnosis ? (
        <article className="rounded-md border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <span className="rounded bg-amber-200 px-2 py-1 text-xs font-semibold text-amber-950">
              错误类型：{diagnosis.errorType}
            </span>
            <span className="rounded bg-white px-2 py-1 text-xs text-amber-900">mock 诊断</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-amber-950">引用回答："{diagnosis.quotedIssue}"</p>
          <p className="mt-2 text-sm leading-6 text-amber-950">{diagnosis.mainProblem}</p>
          <p className="mt-2 text-sm leading-6 text-amber-950">修改建议：{diagnosis.suggestion}</p>
          <div className="mt-3 rounded-md bg-white p-3 text-sm leading-6 text-slate-800">
            强化题：{diagnosis.reinforcementTask}
          </div>
        </article>
      ) : null}
    </section>
  );
}

function InfoGrid({ analysis }) {
  const items = [
    { title: '为什么讲这个知识点', content: analysis.whyThisMatters },
    { title: '前后关联', content: `${analysis.contextRelation.previous} / ${analysis.contextRelation.next}` },
    { title: '考试常考点', content: analysis.examFocus.join('；') },
    { title: '工程应用', content: analysis.engineeringUse.join('；') },
    { title: '易错点', content: analysis.pitfalls.join('；') },
    { title: '学科侧重', content: analysis.subjectFocus },
  ];

  return (
    <article className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <div key={item.title} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-950">{item.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{item.content}</p>
        </div>
      ))}
    </article>
  );
}
