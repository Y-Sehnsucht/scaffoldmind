export function AnalysisPanel({
  analysis,
  deepDive,
  diagnosis,
  userAnswer,
  onUserAnswerChange,
  onOpenPage,
  onDeepDive,
  onDiagnose,
  loadingAction = '',
}) {
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

      <ModeSpecificSection section={analysis.modeSpecific} />

      <InfoGrid analysis={analysis} />

      <article className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-950">主动追问</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {analysis.guidedQuestions.map((question) => (
            <button
              key={question.id}
              className="rounded-md border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-teal-300 hover:bg-teal-50"
              type="button"
              disabled={Boolean(loadingAction)}
              onClick={() => onDeepDive(question)}
            >
              <span className="rounded bg-teal-100 px-2 py-1 text-xs font-medium text-teal-800">
                {question.typeLabel}
              </span>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-950">{question.question}</p>
              {loadingAction === `deep-dive:${question.id}` ? (
                <p className="mt-2 text-xs font-semibold text-teal-700">Loading backend mock...</p>
              ) : null}
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

function ModeSpecificSection({ section }) {
  if (!section) {
    return null;
  }

  const renderers = {
    context_stacking: <ContextStackingSection section={section} />,
    after_class_review: <AfterClassReviewSection section={section} />,
    examiner_perspective: <ExaminerSection section={section} />,
    feynman: <FeynmanSection section={section} />,
    multi_source_collision: <CollisionSection section={section} />,
  };

  return (
    <article className="rounded-md border border-teal-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-950">{section.title}</h3>
      <div className="mt-4">{renderers[section.type]}</div>
    </article>
  );
}

function ContextStackingSection({ section }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <ListBlock title="本周 5 个核心概念" items={section.weeklyCoreConcepts} />
      <ListBlock title="与上周联系" items={section.connectionToLastWeek} />
      <ListBlock title="课堂验证清单" items={section.classroomValidationChecklist} />
      <ListBlock title="补漏清单" items={section.gapChecklist} />
      <ListBlock className="md:col-span-2" title="出题人区分点" items={section.examinerDistinction} />
    </div>
  );
}

function AfterClassReviewSection({ section }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <ListBlock title={`第 ${section.pageNumber} 页核心概念`} items={section.coreConcepts.map((item) => item.name)} />
      <ListBlock title="本质解释" items={section.essenceExplanation} />
      <ListBlock title="考点" items={section.examFocus} />
      <ListBlock title="易错点" items={section.pitfalls} />
    </div>
  );
}

function ExaminerSection({ section }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <ListBlock title="题目考点" items={section.testedPoints} />
      <TextBlock title="出题意图" text={section.examinerIntent} />
      <ListBlock title="表层理解陷阱" items={section.surfaceTraps} />
      <TextBlock title="底层逻辑" text={section.underlyingLogic} />
      <ListBlock className="md:col-span-2" title="迁移题" items={section.transferQuestions} />
    </div>
  );
}

function FeynmanSection({ section }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <ListBlock title="解释中准确的部分" items={section.accurateParts} />
      <TextBlock title="最大偏差" text={section.biggestDeviation} />
      <TextBlock title="为什么偏差重要" text={section.whyDeviationMatters} />
      <TextBlock title="12 岁也能懂的解释" text={section.twelveYearOldExplanation} />
      <TextBlock className="md:col-span-2" title="反问题" text={section.checkingQuestion} />
    </div>
  );
}

function CollisionSection({ section }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <ListBlock title="资料 A/B/C 观点" items={section.sourceViews.map((item) => `${item.source}: ${item.view}`)} />
      <ListBlock title="冲突点" items={section.conflicts} />
      <ListBlock title="证据强弱" items={section.evidenceStrength} />
      <ListBlock title="可采纳结论" items={section.adoptableConclusions} />
      <ListBlock className="md:col-span-2" title="保留怀疑点" items={section.doubtsToKeep} />
    </div>
  );
}

function ListBlock({ title, items, className = '' }) {
  return (
    <section className={`rounded-md border border-slate-200 bg-slate-50 p-4 ${className}`}>
      <h4 className="text-sm font-semibold text-slate-950">{title}</h4>
      <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-600">
        {items.map((item) => (
          <li key={item}>- {item}</li>
        ))}
      </ul>
    </section>
  );
}

function TextBlock({ title, text, className = '' }) {
  return (
    <section className={`rounded-md border border-slate-200 bg-slate-50 p-4 ${className}`}>
      <h4 className="text-sm font-semibold text-slate-950">{title}</h4>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
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
