"use client";

import { useState, useRef, type ChangeEvent } from "react";
import { ChevronDown, Camera, Image as ImageIcon, User } from "lucide-react";
import type { Locale } from "@/common/lib/i18n";
import { useI18n } from "@/common/lib/I18nProvider";
import type {
  BriefFaqItem,
  BriefImage,
  BriefLink,
  BriefSection,
  BriefTeamMember,
  BriefTimelineItem,
  BriefBudgetItem,
  BriefDecisionItem,
  SectionData
} from "@/features/briefly/domain/briefTypes";
import {
  PROJECT_CATEGORIES,
  PROJECT_STAGES,
  PROJECT_STATUSES,
  TIMELINE_OPTIONS
} from "@/features/briefly/domain/briefTypes";
import { IMAGE_UPLOAD_PRESETS, processImageFile } from "@/features/briefly/infrastructure/imageUpload";
import { FILE_UPLOAD_LIMITS, processAttachmentFile } from "@/features/briefly/infrastructure/fileUpload";
import { getBrieflyCopy, getSectionCopy } from "@/features/briefly/application/brieflyCopy";
import {
  attachmentsValue,
  faqValue,
  imagesValue,
  linksValue,
  stringArrayValue,
  teamValue,
  timelineItemsValue,
  budgetValue,
  decisionValue,
  textValue
} from "@/features/briefly/ui/sectionData";
import {
  Checklist,
  ListTextArea,
  SelectInput,
  TextArea,
  TextInput,
  inputClass
} from "@/features/briefly/ui/SectionEditorControls";

interface SectionEditorProps {
  section: BriefSection;
  onChangeData: (patch: SectionData) => void;
  mode?: "inline" | "inspector";
}

type SectionEditorCopy = ReturnType<typeof getBrieflyCopy>["sectionEditor"];
type SectionEditorFieldKey = keyof SectionEditorCopy["fields"];

function toRaciType(value: string): BriefTeamMember["raci_type"] {
  switch (value) {
    case "responsible":
    case "accountable":
    case "consulted":
    case "informed":
      return value;
    default:
      return "";
  }
}

function toDecisionStatus(value: string): BriefDecisionItem["status"] {
  switch (value) {
    case "approved":
    case "rejected":
      return value;
    default:
      return "pending";
  }
}

function field(copy: SectionEditorCopy, key: SectionEditorFieldKey) {
  const [label, helper] = copy.fields[key];
  return {
    label,
    helper: helper || undefined
  };
}

export function SectionEditor({ section, onChangeData, mode = "inline" }: SectionEditorProps) {
  const { locale } = useI18n();
  const copy = getBrieflyCopy(locale).sectionEditor;
  const sectionTitle = getSectionCopy(section.type, locale).title;

  if (mode === "inspector") {
    return (
      <div className="briefly-property-editor grid gap-5">
        <SectionFields section={section} locale={locale} copy={copy} onChangeData={onChangeData} />
      </div>
    );
  }

  return (
    <div className="briefly-edit-panel mt-4 rounded-[6px] border border-[#cfcfcf] bg-[#f5f5f5] p-4 text-[#151515] shadow-[0_12px_30px_rgba(0,0,0,0.06)]">
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-[#d7d7d7] pb-3">
        <div>
          <p className="text-sm font-semibold">{copy.editLabel} {sectionTitle}</p>
          <p className="mt-1 text-xs text-[#686868]">{copy.inlineHelp}</p>
        </div>
      </div>
      <div className="grid gap-4">
        <SectionFields section={section} locale={locale} copy={copy} onChangeData={onChangeData} />
      </div>
    </div>
  );
}

function SectionFields({
  section,
  locale,
  copy,
  onChangeData
}: SectionEditorProps & { locale: Locale; copy: SectionEditorCopy }) {
  switch (section.type) {
    case "cover":
      return <CoverEditor section={section} locale={locale} copy={copy} onChangeData={onChangeData} />;
    case "budget":
      return <BudgetEditor section={section} copy={copy} onChangeData={onChangeData} />;
    case "decisions":
      return <DecisionEditor section={section} copy={copy} onChangeData={onChangeData} />;
    case "background":
      return (
        <>
          <TextArea
            {...field(copy, "visionStatement")}
            value={textValue(section, "vision_statement")}
            onChange={(value) => onChangeData({ vision_statement: value })}
          />
          <TextArea
            {...field(copy, "problemStatement")}
            value={textValue(section, "problem_statement")}
            onChange={(value) => onChangeData({ problem_statement: value })}
          />
          <TextArea
            {...field(copy, "background")}
            value={textValue(section, "background")}
            onChange={(value) => onChangeData({ background: value })}
          />
          <TextArea
            {...field(copy, "contextNote")}
            value={textValue(section, "context_note")}
            onChange={(value) => onChangeData({ context_note: value })}
          />
        </>
      );
    case "goal":
      return (
        <>
          <TextArea
            {...field(copy, "primaryGoal")}
            value={textValue(section, "primary_goal")}
            onChange={(value) => onChangeData({ primary_goal: value })}
          />
          <ListTextArea
            copy={copy}
            {...field(copy, "secondaryGoals")}
            items={stringArrayValue(section, "secondary_goals")}
            onChange={(items) => onChangeData({ secondary_goals: items })}
          />
          <ListTextArea
            copy={copy}
            {...field(copy, "nonGoals")}
            items={stringArrayValue(section, "non_goals")}
            onChange={(items) => onChangeData({ non_goals: items })}
          />
          <TextArea
            {...field(copy, "successSignal")}
            value={textValue(section, "success_signal")}
            onChange={(value) => onChangeData({ success_signal: value })}
          />
        </>
      );


    case "timeline":
      return <TimelineEditor section={section} copy={copy} onChangeData={onChangeData} />;
    case "deliverables":
      return (
        <>
          <ListTextArea
            copy={copy}
            {...field(copy, "deliverables")}
            items={stringArrayValue(section, "deliverables")}
            onChange={(items) => onChangeData({ deliverables: items })}
          />
          <ListTextArea
            copy={copy}
            {...field(copy, "outOfScope")}
            items={stringArrayValue(section, "out_of_scope")}
            onChange={(items) => onChangeData({ out_of_scope: items })}
          />
          <TextArea
            {...field(copy, "expectedOutputs")}
            value={textValue(section, "expected_outputs")}
            onChange={(value) => onChangeData({ expected_outputs: value })}
          />
          <TextArea
            {...field(copy, "scopeNotes")}
            value={textValue(section, "scope_notes")}
            onChange={(value) => onChangeData({ scope_notes: value })}
          />
        </>
      );

    case "resources":
      return <ResourcesEditor section={section} copy={copy} onChangeData={onChangeData} />;
    case "risks":
      return (
        <>
          <ListTextArea
            copy={copy}
            {...field(copy, "risks")}
            items={stringArrayValue(section, "risks")}
            onChange={(items) => onChangeData({ risks: items })}
          />
          <ListTextArea
            copy={copy}
            {...field(copy, "mitigationPlans")}
            items={stringArrayValue(section, "mitigation_plans")}
            onChange={(items) => onChangeData({ mitigation_plans: items })}
          />
          <ListTextArea
            copy={copy}
            {...field(copy, "openQuestions")}
            items={stringArrayValue(section, "open_questions")}
            onChange={(items) => onChangeData({ open_questions: items })}
          />
          <ListTextArea
            copy={copy}
            {...field(copy, "assumptions")}
            items={stringArrayValue(section, "assumptions_to_validate")}
            onChange={(items) => onChangeData({ assumptions_to_validate: items })}
          />
        </>
      );
    case "audience":
      return (
        <>
          <TextArea
            {...field(copy, "targetUsers")}
            value={textValue(section, "target_users")}
            onChange={(value) => onChangeData({ target_users: value })}
          />
          <ListTextArea
            copy={copy}
            {...field(copy, "useCases")}
            items={stringArrayValue(section, "use_cases")}
            onChange={(items) => onChangeData({ use_cases: items })}
          />
          <TextArea
            {...field(copy, "earlyAdopters")}
            value={textValue(section, "early_adopters")}
            onChange={(value) => onChangeData({ early_adopters: value })}
          />
        </>
      );

    case "team":
      return <TeamEditor section={section} copy={copy} onChangeData={onChangeData} />;
    case "faq":
      return <FaqEditor section={section} copy={copy} onChangeData={onChangeData} />;

    default:
      return null;
  }
}

function TimelineEditor({
  section,
  copy,
  onChangeData
}: SectionEditorProps & { copy: SectionEditorCopy }) {
  const timelineItems = timelineItemsValue(section);

  function updateTimelineItem(id: string, patch: Partial<BriefTimelineItem>) {
    onChangeData({
      timeline_items: timelineItems.map((item) => (item.id === id ? { ...item, ...patch } : item))
    });
  }

  function addTimelineItem() {
    onChangeData({
      timeline_items: [
        ...timelineItems,
        {
          id: createEditorItemId("timeline"),
          label: copy.timelineItemDefault,
          date: "",
          endDate: "",
          note: ""
        }
      ]
    });
  }

  function removeTimelineItem(id: string) {
    onChangeData({ timeline_items: timelineItems.filter((item) => item.id !== id) });
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          {...field(copy, "startDate")}
          type="date"
          value={textValue(section, "start_date")}
          onChange={(value) => onChangeData({ start_date: value })}
        />
        <TextInput
          {...field(copy, "targetDate")}
          type="date"
          value={textValue(section, "target_date")}
          onChange={(value) => onChangeData({ target_date: value })}
        />
      </div>

      <div className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-white/90">{copy.timelineItems}</p>
            <p className="mt-1 text-xs text-white/50">{copy.timelineItemsHelp}</p>
          </div>
          <button type="button" onClick={addTimelineItem} className="control-button text-white">
            {copy.addTime}
          </button>
        </div>

        {timelineItems.length ? (
          timelineItems.map((item) => (
            <div key={item.id} className="grid gap-3 rounded-lg border border-white/10 bg-[#0a0a0a] p-3">
              <input
                value={item.label}
                placeholder={copy.timelineLabel}
                onChange={(event) => updateTimelineItem(item.id, { label: event.target.value })}
                className={inputClass()}
              />
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  type="date"
                  value={item.date}
                  aria-label={copy.timelineDate}
                  onChange={(event) => updateTimelineItem(item.id, { date: event.target.value })}
                  className={inputClass()}
                />
                <input
                  type="date"
                  value={item.endDate ?? ""}
                  aria-label={copy.timelineEndDate}
                  onChange={(event) => updateTimelineItem(item.id, { endDate: event.target.value })}
                  className={inputClass()}
                />
              </div>
              <textarea
                value={item.note ?? ""}
                rows={2}
                placeholder={copy.timelineNote}
                onChange={(event) => updateTimelineItem(item.id, { note: event.target.value })}
                className={`${inputClass()} resize-y leading-6`}
              />
              <button
                type="button"
                onClick={() => removeTimelineItem(item.id)}
                className="justify-self-start text-xs font-medium text-red-400 transition hover:text-red-300"
              >
                {copy.remove}
              </button>
            </div>
          ))
        ) : (
          <p className="text-xs text-white/60">{copy.noTimelineItems}</p>
        )}
      </div>

      <ListTextArea
        copy={copy}
        {...field(copy, "milestones")}
        items={stringArrayValue(section, "milestones")}
        onChange={(items) => onChangeData({ milestones: items })}
      />
      <ListTextArea
        copy={copy}
        {...field(copy, "dependencies")}
        items={stringArrayValue(section, "dependencies")}
        onChange={(items) => onChangeData({ dependencies: items })}
      />
    </>
  );
}

function ResourcesEditor({
  section,
  copy,
  onChangeData
}: SectionEditorProps & { copy: SectionEditorCopy }) {
  const attachments = attachmentsValue(section);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [uploadError, setUploadError] = useState("");

  function removeAttachment(id: string) {
    onChangeData({ attachments: attachments.filter((attachment) => attachment.id !== id) });
  }

  async function handleAttachmentFiles(event: ChangeEvent<HTMLInputElement>) {
    const slots = Math.max(0, FILE_UPLOAD_LIMITS.maxFiles - attachments.length);
    const files = Array.from(event.target.files ?? []).slice(0, slots);

    if (!files.length) {
      event.target.value = "";
      return;
    }

    setUploadingFiles(true);
    setUploadError("");

    try {
      const uploaded = await Promise.all(files.map((file) => processAttachmentFile(file)));
      onChangeData({ attachments: [...attachments, ...uploaded].slice(0, FILE_UPLOAD_LIMITS.maxFiles) });
    } catch (error) {
      console.error(error);
      setUploadError(copy.fileTooLarge);
    } finally {
      setUploadingFiles(false);
      event.target.value = "";
    }
  }

  return (
    <>
      <ListTextArea
        copy={copy}
        {...field(copy, "availableAssets")}
        items={stringArrayValue(section, "available_assets")}
        onChange={(items) => onChangeData({ available_assets: items })}
      />

      <div className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-white/90">{copy.attachments}</p>
            <p className="mt-1 text-xs text-white/50">{copy.attachmentsHelp}</p>
          </div>
          <label className="control-button cursor-pointer text-white">
            {uploadingFiles ? copy.processing : copy.uploadFiles}
            <input
              type="file"
              multiple
              disabled={uploadingFiles || attachments.length >= FILE_UPLOAD_LIMITS.maxFiles}
              onChange={handleAttachmentFiles}
              className="sr-only"
            />
          </label>
        </div>

        {uploadError ? <p className="text-xs text-red-300">{uploadError}</p> : null}

        {attachments.length ? (
          <div className="grid gap-2">
            {attachments.map((attachment) => (
              <div key={attachment.id} className="grid gap-3 rounded-lg border border-white/10 bg-[#0a0a0a] p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white/85">{attachment.name}</p>
                  <p className="mt-1 text-xs text-white/45">
                    {attachment.type || copy.unknownFileType} · {formatBytes(attachment.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeAttachment(attachment.id)}
                  className="justify-self-start text-xs font-medium text-red-400 transition hover:text-red-300"
                >
                  {copy.remove}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-white/60">{copy.noAttachments}</p>
        )}
      </div>

      <TextArea
        {...field(copy, "filesOrLinks")}
        value={textValue(section, "files_or_links")}
        onChange={(value) => onChangeData({ files_or_links: value })}
      />
      <TextArea
        {...field(copy, "assetNotes")}
        value={textValue(section, "asset_notes")}
        onChange={(value) => onChangeData({ asset_notes: value })}
      />
    </>
  );
}

function ReferencesEditor({
  section,
  copy,
  onChangeData
}: SectionEditorProps & { copy: SectionEditorCopy }) {
  const links = linksValue(section);
  const images = imagesValue(section);
  const [uploadingImages, setUploadingImages] = useState(false);

  function updateLink(id: string, patch: Partial<BriefLink>) {
    onChangeData({
      links: links.map((link) => (link.id === id ? { ...link, ...patch } : link))
    });
  }

  function addLink() {
    onChangeData({
      links: [
        ...links,
        { id: `link_${links.length + 1}`, label: copy.referenceDefault, url: "" }
      ]
    });
  }

  function removeLink(id: string) {
    onChangeData({ links: links.filter((link) => link.id !== id) });
  }

  async function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).slice(0, Math.max(0, 5 - images.length));

    if (!files.length) {
      event.target.value = "";
      return;
    }

    setUploadingImages(true);

    try {
      const uploaded = await Promise.all(
        files.map(async (file, index) => {
          const image = await processImageFile(file, IMAGE_UPLOAD_PRESETS.reference);

          return {
            id: `image_${Date.now().toString(36)}_${index}_${file.name}`,
            src: image.dataUrl,
            caption: file.name.replace(/\.[^.]+$/, "")
          };
        })
      );

      onChangeData({ images: [...images, ...uploaded].slice(0, 5) });
    } catch (error) {
      console.error(error);
    } finally {
      setUploadingImages(false);
      event.target.value = "";
    }
  }

  function updateImage(id: string, patch: Partial<BriefImage>) {
    onChangeData({
      images: images.map((image) => (image.id === id ? { ...image, ...patch } : image))
    });
  }

  function removeImage(id: string) {
    onChangeData({ images: images.filter((image) => image.id !== id) });
  }

  return (
    <>
      <div className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-white/90">{copy.referenceLinks}</p>
          <button type="button" onClick={addLink} className="control-button text-white">
            {copy.addLink}
          </button>
        </div>
        {links.length ? (
          links.map((link) => (
            <div key={link.id} className="grid gap-3 rounded-lg border border-white/10 bg-[#0a0a0a] p-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  value={link.label}
                  placeholder={copy.displayName}
                  onChange={(event) => updateLink(link.id, { label: event.target.value })}
                  className={inputClass()}
                />
                <input
                  value={link.url}
                  placeholder={copy.url}
                  onChange={(event) => updateLink(link.id, { url: event.target.value })}
                  className={inputClass()}
                />
              </div>
              <button
                type="button"
                onClick={() => removeLink(link.id)}
                className="justify-self-start text-xs font-medium text-red-400 hover:text-red-300 transition"
              >
                {copy.remove}
              </button>
            </div>
          ))
        ) : (
          <p className="text-xs text-white/60">{copy.noLinks}</p>
        )}
      </div>

      <div className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-white/90">{copy.referenceImages}</p>
          <label className="control-button cursor-pointer text-white">
            {uploadingImages ? copy.processing : copy.uploadImage}
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={uploadingImages}
              onChange={handleFiles}
              className="sr-only"
            />
          </label>
        </div>
        {images.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {images.map((image) => (
              <div key={image.id} className="grid gap-3 rounded-lg border border-white/10 bg-[#0a0a0a] p-3">
                <img
                  src={image.src}
                  alt={image.caption || copy.referenceImageAlt}
                  className="aspect-[4/3] w-full rounded-md border border-white/10 object-cover"
                />
                <input
                  value={image.caption}
                  placeholder={copy.imageCaption}
                  onChange={(event) => updateImage(image.id, { caption: event.target.value })}
                  className={inputClass()}
                />
                <button
                  type="button"
                  onClick={() => removeImage(image.id)}
                  className="justify-self-start text-xs font-medium text-red-400 hover:text-red-300 transition"
                >
                  {copy.remove}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-white/60">{copy.imageLimit}</p>
        )}
      </div>
    </>
  );
}

function TeamEditor({
  section,
  copy,
  onChangeData
}: SectionEditorProps & { copy: SectionEditorCopy }) {
  const members = teamValue(section);

  function addMember() {
    onChangeData({
      team_members: [
        ...members,
        { id: createTeamMemberId(), name: "", role: "" }
      ]
    });
  }

  function updateMember(id: string, patch: Partial<BriefTeamMember>) {
    onChangeData({
      team_members: members.map((member) =>
        member.id === id ? { ...member, ...patch } : member
      )
    });
  }

  function removeMember(id: string) {
    onChangeData({ team_members: members.filter((member) => member.id !== id) });
  }

  return (
    <>
      <div className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-white/90">{copy.teamRoster}</p>
          <button type="button" onClick={addMember} className="control-button text-white">
            {copy.addMember}
          </button>
        </div>
        {members.length ? (
          members.map((member, index) => (
            <div key={`${member.id || "member"}_${index}`} className="flex gap-4 rounded-lg border border-white/10 bg-[#0a0a0a] p-3 items-start">
              <AvatarUploader
                value={member.avatar}
                onChange={(base64) => updateMember(member.id, { avatar: base64 })}
              />
              <div className="flex-1 grid gap-2">
                <div className="grid gap-2 sm:grid-cols-3">
                <input
                  value={member.name}
                  placeholder={copy.name}
                  onChange={(event) => updateMember(member.id, { name: event.target.value })}
                  className={inputClass()}
                />
                <input
                  value={member.role}
                  placeholder={copy.role}
                  onChange={(event) => updateMember(member.id, { role: event.target.value })}
                  className={inputClass()}
                />
                <select
                  value={member.raci_type || ""}
                  onChange={(event) => updateMember(member.id, { raci_type: toRaciType(event.target.value) })}
                  className={inputClass()}
                  aria-label={copy.raciType}
                >
                  <option value="">{copy.raciType}</option>
                  <option value="responsible">{copy.raciLabels.responsible}</option>
                  <option value="accountable">{copy.raciLabels.accountable}</option>
                  <option value="consulted">{copy.raciLabels.consulted}</option>
                  <option value="informed">{copy.raciLabels.informed}</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => removeMember(member.id)}
                className="justify-self-start text-xs font-medium text-red-400 hover:text-red-300 transition"
              >
                {copy.remove}
              </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-white/60">{copy.noMembers}</p>
        )}
      </div>
      <TextArea
        {...field(copy, "roles")}
        value={textValue(section, "roles")}
        onChange={(value) => onChangeData({ roles: value })}
      />
      <TextArea
        {...field(copy, "currentGaps")}
        value={textValue(section, "current_gaps")}
        onChange={(value) => onChangeData({ current_gaps: value })}
      />
    </>
  );
}

function createTeamMemberId() {
  return createEditorItemId("member");
}

function createEditorItemId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
  if (bytes < 1_000_000) return `${Math.max(1, Math.round(bytes / 1000))} KB`;
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
}

function CoverEditor({
  section,
  copy,
  locale,
  onChangeData
}: SectionEditorProps & { copy: SectionEditorCopy; locale: Locale }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverImage = textValue(section, "cover_image");
  const [uploading, setUploading] = useState(false);

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);

    try {
      const image = await processImageFile(file, IMAGE_UPLOAD_PRESETS.cover);
      onChangeData({ cover_image: image.dataUrl });
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <>
      <div className="briefly-cover-field grid gap-2">
        <label className="briefly-cover-field-label text-xs font-semibold">{copy.coverImage}</label>
        <p className="briefly-cover-field-help text-[11px]">{copy.coverImageHelp}</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="sr-only"
        />
        {coverImage ? (
          <div className="briefly-cover-image-preview group relative overflow-hidden rounded-lg border">
            <img src={coverImage} alt="Cover" className="aspect-[2/1] w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity hover:opacity-100">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/20"
              >
                {copy.replace}
              </button>
              <button
                type="button"
                onClick={() => onChangeData({ cover_image: "" })}
                className="rounded border border-red-500/30 bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-100 transition hover:bg-red-500/40"
              >
                {copy.remove}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="briefly-cover-upload-button flex min-h-[88px] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-6 text-xs font-medium transition"
          >
            <span className="briefly-cover-upload-icon flex h-9 w-9 items-center justify-center rounded-full">
              <ImageIcon className="h-4 w-4" />
            </span>
            <span>{uploading ? getBrieflyCopy(locale).builder.left.processingImage : copy.uploadClick}</span>
          </button>
        )}
      </div>
      <TextInput
        {...field(copy, "projectName")}
        value={textValue(section, "project_name")}
        onChange={(value) => onChangeData({ project_name: value })}
      />
      <TextArea
        {...field(copy, "oneLiner")}
        rows={2}
        value={textValue(section, "one_liner")}
        onChange={(value) => onChangeData({ one_liner: value })}
      />
      <div className="grid gap-4">
        <SelectInput
          label={field(copy, "category").label}
          locale={locale}
          copy={copy}
          value={textValue(section, "project_category")}
          options={PROJECT_CATEGORIES}
          onChange={(value) => onChangeData({ project_category: value })}
        />
        <SelectInput
          label={field(copy, "stage").label}
          locale={locale}
          copy={copy}
          value={textValue(section, "project_stage")}
          options={PROJECT_STAGES}
          onChange={(value) => onChangeData({ project_stage: value })}
        />
        <SelectInput
          label={field(copy, "status").label}
          locale={locale}
          copy={copy}
          value={textValue(section, "status")}
          options={PROJECT_STATUSES}
          onChange={(value) => onChangeData({ status: value })}
        />
        <TextInput
          {...field(copy, "owner")}
          value={textValue(section, "owner")}
          onChange={(value) => onChangeData({ owner: value })}
        />
        <div className="grid gap-2 text-sm">
          <span className="font-medium text-white/90">{field(copy, "confidentiality").label}</span>
          <div className="relative">
            <select
              value={textValue(section, "confidentiality") || "internal"}
              onChange={(e) => onChangeData({ confidentiality: e.target.value })}
              className={`${inputClass()} appearance-none pr-8`}
            >
              <option value="internal">Internal</option>
              <option value="confidential">Confidential</option>
              <option value="public">Public</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          </div>
          <span className="text-xs leading-5 text-white/60">{field(copy, "confidentiality").helper}</span>
        </div>
      </div>
    </>
  );
}

function FaqEditor({
  section,
  copy,
  onChangeData
}: SectionEditorProps & { copy: SectionEditorCopy }) {
  const items = faqValue(section);

  function addItem() {
    onChangeData({
      faq_items: [
        ...items,
        { id: `faq_${items.length + 1}`, question: "", answer: "" }
      ]
    });
  }

  function updateItem(id: string, patch: Partial<BriefFaqItem>) {
    onChangeData({
      faq_items: items.map((item) => (item.id === id ? { ...item, ...patch } : item))
    });
  }

  function removeItem(id: string) {
    onChangeData({ faq_items: items.filter((item) => item.id !== id) });
  }

  return (
    <div className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-white/90">{copy.faq}</p>
        <button type="button" onClick={addItem} className="control-button text-white">
          {copy.addQuestion}
        </button>
      </div>
      {items.length ? (
        items.map((item) => (
          <div key={item.id} className="grid gap-3 rounded-lg border border-white/10 bg-[#0a0a0a] p-3">
            <input
              value={item.question}
              placeholder={copy.questionPlaceholder}
              onChange={(event) => updateItem(item.id, { question: event.target.value })}
              className={inputClass()}
            />
            <textarea
              value={item.answer}
              placeholder={copy.answerPlaceholder}
              onChange={(event) => updateItem(item.id, { answer: event.target.value })}
              rows={3}
              className={`${inputClass()} resize-y leading-6`}
            />
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              className="justify-self-start text-xs font-medium text-red-400 hover:text-red-300 transition"
            >
              {copy.remove}
            </button>
          </div>
        ))
      ) : (
        <p className="text-xs text-white/60">{copy.noFaq}</p>
      )}
    </div>
  );
}

function AvatarUploader({ value, onChange }: { value?: string; onChange: (base64: string) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    try {
      const image = await processImageFile(file, IMAGE_UPLOAD_PRESETS.avatar);
      onChange(image.dataUrl);
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="group relative flex-shrink-0">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.02] transition-colors hover:border-white/20 hover:bg-white/[0.05]"
      >
        {value ? (
          <>
            <img src={value} alt="Avatar" className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="h-4 w-4 text-white" />
            </div>
          </>
        ) : (
          uploading ? <span className="text-[9px] font-medium text-white/50">...</span> : <User className="h-5 w-5 text-white/40" />
        )}
      </button>
    </div>
  );
}

function BudgetEditor({
  section,
  copy,
  onChangeData
}: {
  section: BriefSection;
  copy: SectionEditorCopy;
  onChangeData: (patch: SectionData) => void;
}) {
  const items = budgetValue(section);

  function addItem() {
    const newItem: BriefBudgetItem = {
      id: crypto.randomUUID(),
      category: "",
      amount: "",
      note: ""
    };
    onChangeData({ budget_items: [...items, newItem] });
  }

  function updateItem(id: string, patch: Partial<BriefBudgetItem>) {
    onChangeData({
      budget_items: items.map((item) => (item.id === id ? { ...item, ...patch } : item))
    });
  }

  function removeItem(id: string) {
    onChangeData({ budget_items: items.filter((item) => item.id !== id) });
  }

  return (
    <>
      <div className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-white/90">{copy.fields.totalBudget[0]}</p>
          <button type="button" onClick={addItem} className="control-button text-white">
            {copy.addBudgetItem}
          </button>
        </div>
        {items.length ? (
          items.map((item) => (
            <div key={item.id} className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-lg border border-white/10 bg-[#0a0a0a] p-3">
              <input
                value={item.category}
                placeholder="Category (e.g. Design, Dev)"
                onChange={(e) => updateItem(item.id, { category: e.target.value })}
                className={inputClass()}
              />
              <input
                value={item.amount}
                placeholder="Amount (e.g. $5,000)"
                onChange={(e) => updateItem(item.id, { amount: e.target.value })}
                className={inputClass()}
              />
              <input
                value={item.note}
                placeholder="Notes"
                onChange={(e) => updateItem(item.id, { note: e.target.value })}
                className={`${inputClass()} md:col-span-2`}
              />
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="justify-self-start text-xs font-medium text-red-400 hover:text-red-300 transition"
              >
                {copy.removeItem}
              </button>
            </div>
          ))
        ) : (
          <p className="text-xs text-white/60">{copy.noBudgetItems}</p>
        )}
      </div>
      <TextArea
        {...field(copy, "totalBudget")}
        value={textValue(section, "total_budget")}
        onChange={(value) => onChangeData({ total_budget: value })}
      />
      <TextArea
        {...field(copy, "budgetNotes")}
        value={textValue(section, "budget_notes")}
        onChange={(value) => onChangeData({ budget_notes: value })}
      />
    </>
  );
}

function DecisionEditor({
  section,
  copy,
  onChangeData
}: {
  section: BriefSection;
  copy: SectionEditorCopy;
  onChangeData: (patch: SectionData) => void;
}) {
  const items = decisionValue(section);

  function addItem() {
    const newItem: BriefDecisionItem = {
      id: crypto.randomUUID(),
      decision: "",
      rationale: "",
      date: new Date().toISOString().split("T")[0],
      decided_by: "",
      status: "approved"
    };
    onChangeData({ decision_items: [...items, newItem] });
  }

  function updateItem(id: string, patch: Partial<BriefDecisionItem>) {
    onChangeData({
      decision_items: items.map((item) => (item.id === id ? { ...item, ...patch } : item))
    });
  }

  function removeItem(id: string) {
    onChangeData({ decision_items: items.filter((item) => item.id !== id) });
  }

  return (
    <>
      <div className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-white/90">{copy.fields.decisionNotes[0]}</p>
          <button type="button" onClick={addItem} className="control-button text-white">
            {copy.addDecision}
          </button>
        </div>
        {items.length ? (
          items.map((item) => (
            <div key={item.id} className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-lg border border-white/10 bg-[#0a0a0a] p-3">
              <input
                value={item.decision}
                placeholder="Decision made"
                onChange={(e) => updateItem(item.id, { decision: e.target.value })}
                className={`${inputClass()} md:col-span-2`}
              />
              <textarea
                value={item.rationale}
                placeholder="Rationale (Why?)"
                rows={2}
                onChange={(e) => updateItem(item.id, { rationale: e.target.value })}
                className={`${inputClass()} md:col-span-2 resize-y`}
              />
              <input
                type="date"
                value={item.date}
                onChange={(e) => updateItem(item.id, { date: e.target.value })}
                className={inputClass()}
              />
              <input
                value={item.decided_by}
                placeholder="Decided by"
                onChange={(e) => updateItem(item.id, { decided_by: e.target.value })}
                className={inputClass()}
              />
              <div className="relative">
                <select
                  value={item.status}
                  onChange={(e) => updateItem(item.id, { status: toDecisionStatus(e.target.value) })}
                  className={`${inputClass()} appearance-none pr-8`}
                >
                  <option value="approved">{copy.decisionApproved}</option>
                  <option value="pending">{copy.decisionPending}</option>
                  <option value="rejected">{copy.decisionRejected}</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              </div>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="justify-self-start self-center text-xs font-medium text-red-400 hover:text-red-300 transition"
              >
                {copy.removeItem}
              </button>
            </div>
          ))
        ) : (
          <p className="text-xs text-white/60">{copy.noDecisions}</p>
        )}
      </div>
      <TextArea
        {...field(copy, "decisionNotes")}
        value={textValue(section, "decision_notes")}
        onChange={(value) => onChangeData({ decision_notes: value })}
      />
    </>
  );
}
