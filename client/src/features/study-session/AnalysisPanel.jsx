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
      <section className="grid min-h-[520px] place-items-center rounded-[22px] border border-white/10 bg-[#20262e] p-8 text-center">
        <div className="max-w-xl">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-teal-300/15 text-lg font-semibold text-teal-200">
            明序
          </div>
          <h2 className="mt-6 text-3xl font-semibold text-white">让我们开始制作学习笔记...</h2>
          <p className="mt-4 text-sm leading-7 text-slate-400">
            在左侧输入材料并点击生成后，这里会展示结构化解析、主动追问、用户尝试、错误诊断、强化题和 Obsidian 输出。
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <article className="rounded-[22px] border border-white/10 bg-[#20262e] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold text-teal-300">PPT 第 {analysis.pageNumber} 页</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">{analysis.topic}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-400">{analysis.summary}</p>
          </div>
          <button
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-teal-300/50 hover:bg-teal-300/10"
            type="button"
            onClick={onOpenPage}
          >
            查看第 {analysis.pageNumber} 页原始内容
          </button>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {(analysis.coreConcepts || []).map((concept) => (
            <div key={concept.name} className="rounded-2xl border border-white/10 bg-[#171b21] p-4">
              <h3 className="font-semibold text-white">{concept.name}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{concept.simpleExplanation}</p>
              <p className="mt-3 rounded-xl bg-white/5 px-3 py-2 text-sm leading-6 text-slate-200">本质：{concept.essence}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(concept.relatedConcepts || []).map((item) => (
                  <span key={item} className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-slate-300">
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

      <article className="rounded-[22px] border border-white/10 bg-[#20262e] p-5">
        <h3 className="text-base font-semibold text-white">主动追问</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {(analysis.guidedQuestions || []).map((question) => (
            <button
              key={question.id}
              className="rounded-2xl border border-white/10 bg-[#171b21] p-4 text-left transition hover:border-teal-300/50 hover:bg-teal-300/10 disabled:cursor-not-allowed disabled:opacity-70"
              type="button"
              disabled={Boolean(loadingAction)}
              onClick={() => onDeepDive(question)}
            >
              <span className="rounded-full bg-teal-300/15 px-2.5 py-1 text-xs font-medium text-teal-200">
                {question.typeLabel}
              </span>
              <p className="mt-3 text-sm font-semibold leading-6 text-white">{question.question}</p>
              {loadingAction === `deep-dive:${question.id}` ? (
                <p className="mt-2 text-xs font-semibold text-teal-300">正在请求...</p>
              ) : null}
              <p className="mt-2 text-xs leading-5 text-slate-500">{question.reason}</p>
            </button>
          ))}
        </div>
      </article>

      {deepDive ? (
        <article className="rounded-[22px] border border-teal-300/20 bg-teal-300/10 p-5">
          <h3 className="text-base font-semibold text-teal-50">深入回答</h3>
          <p className="mt-2 text-sm leading-7 text-teal-50/90">{deepDive.answer}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(deepDive.keyPoints || []).map((point) => (
              <span key={point} className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-teal-50">
                {point}
              </span>
            ))}
          </div>
        </article>
      ) : null}

      <article className="rounded-[22px] border border-white/10 bg-[#20262e] p-5">
        <h3 className="text-base font-semibold text-white">用户尝试</h3>
        <p className="mt-2 text-sm leading-7 text-slate-300">{analysis.userTask?.question}</p>
        <textarea
          className="mt-4 min-h-28 w-full resize-y rounded-2xl border border-white/10 bg-[#14181e] px-4 py-3 text-sm leading-6 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-teal-300 focus:ring-2 focus:ring-teal-300/20"
          value={userAnswer}
          onChange={(event) => onUserAnswerChange(event.target.value)}
          placeholder="写下你的解释，再让 Mock 诊断指出偏差"
        />
        <button
          className="mt-3 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[#111418] transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
          type="button"
          disabled={loadingAction === 'diagnose'}
          onClick={onDiagnose}
        >
          {loadingAction === 'diagnose' ? '诊断中...' : '提交回答并诊断'}
        </button>
      </article>

      {diagnosis ? (
        <article className="rounded-[22px] border border-amber-300/20 bg-amber-300/10 p-5">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-amber-200/20 px-2.5 py-1 text-xs font-semibold text-amber-100">
              错误类型：{diagnosis.errorType}
            </span>
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-amber-100">诊断结果</span>
          </div>
          <p className="mt-3 text-sm leading-7 text-amber-50">引用回答："{diagnosis.quotedIssue}"</p>
          <p className="mt-2 text-sm leading-7 text-amber-50/90">{diagnosis.mainProblem}</p>
          <p className="mt-2 text-sm leading-7 text-amber-50/90">修改建议：{diagnosis.suggestion}</p>
          <div className="mt-4 rounded-2xl bg-[#171b21] p-4 text-sm leading-7 text-slate-100">
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
    <article className="rounded-[22px] border border-white/10 bg-[#20262e] p-5">
      <h3 className="text-base font-semibold text-white">{section.title}</h3>
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
      <ListBlock title={`第 ${section.pageNumber} 页核心概念`} items={(section.coreConcepts || []).map((item) => item.name)} />
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
      <ListBlock title="资料 A/B/C 观点" items={(section.sourceViews || []).map((item) => `${item.source}: ${item.view}`)} />
      <ListBlock title="冲突点" items={section.conflicts} />
      <ListBlock title="证据强弱" items={section.evidenceStrength} />
      <ListBlock title="可采纳结论" items={section.adoptableConclusions} />
      <ListBlock className="md:col-span-2" title="保留怀疑点" items={section.doubtsToKeep} />
    </div>
  );
}

function ListBlock({ title, items = [], className = '' }) {
  return (
    <section className={`rounded-2xl border border-white/10 bg-[#171b21] p-4 ${className}`}>
      <h4 className="text-sm font-semibold text-slate-100">{title}</h4>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-400">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-300/70" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function TextBlock({ title, text, className = '' }) {
  return (
    <section className={`rounded-2xl border border-white/10 bg-[#171b21] p-4 ${className}`}>
      <h4 className="text-sm font-semibold text-slate-100">{title}</h4>
      <p className="mt-3 text-sm leading-6 text-slate-400">{text}</p>
    </section>
  );
}

function InfoGrid({ analysis }) {
  const items = [
    { title: '为什么讲这个知识点', content: analysis.whyThisMatters },
    { title: '前后关联', content: `${analysis.contextRelation?.previous || ''} / ${analysis.contextRelation?.next || ''}` },
    { title: '考试常考点', content: (analysis.examFocus || []).join('；') },
    { title: '工程应用', content: (analysis.engineeringUse || []).join('；') },
    { title: '易错点', content: (analysis.pitfalls || []).join('；') },
    { title: '学科侧重', content: analysis.subjectFocus },
  ];

  return (
    <article className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <div key={item.title} className="rounded-2xl border border-white/10 bg-[#20262e] p-4">
          <h3 className="text-sm font-semibold text-white">{item.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">{item.content}</p>
        </div>
      ))}
    </article>
  );
}
