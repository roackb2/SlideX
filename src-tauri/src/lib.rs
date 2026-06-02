use serde::{Deserialize, Serialize};
use std::{
    fs,
    path::{Path, PathBuf},
    time::{SystemTime, UNIX_EPOCH},
};
use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem, Submenu},
    Emitter,
};

#[derive(Debug, Deserialize, Serialize)]
struct SlidexManifest {
    name: String,
    version: u8,
    updated_at: u64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct SlidexProject {
    name: String,
    path: String,
    source: String,
}

#[tauri::command]
fn open_slidex_project() -> Result<Option<SlidexProject>, String> {
    let Some(project_dir) = rfd::FileDialog::new()
        .set_title("Open SlideX Project")
        .pick_folder()
    else {
        return Ok(None);
    };

    read_project(&project_dir).map(Some)
}

#[tauri::command]
fn open_slidex_project_at(project_path: String) -> Result<SlidexProject, String> {
    read_project(&PathBuf::from(project_path))
}

#[tauri::command]
fn save_slidex_project(
    source: String,
    project_path: Option<String>,
    project_name: Option<String>,
) -> Result<Option<SlidexProject>, String> {
    let project_dir = match project_path.filter(|path| !path.trim().is_empty()) {
        Some(path) => PathBuf::from(path),
        None => {
            let fallback_name = project_name
                .as_deref()
                .map(str::trim)
                .filter(|name| !name.is_empty())
                .unwrap_or("Untitled");
            let suggested_name = format!("{}.slidex", sanitize_project_name(fallback_name));

            let Some(path) = rfd::FileDialog::new()
                .set_title("Save SlideX Project")
                .set_file_name(&suggested_name)
                .save_file()
            else {
                return Ok(None);
            };

            ensure_slidex_extension(path)
        }
    };

    write_project(&project_dir, &source)?;
    read_project(&project_dir).map(Some)
}

#[tauri::command]
fn export_slidex_file(
    content: String,
    default_filename: String,
    extension: String,
) -> Result<Option<String>, String> {
    let extension = sanitize_extension(&extension);
    let file_name = ensure_file_extension(
        PathBuf::from(sanitize_project_name(&default_filename)),
        &extension,
    );
    let title = if extension == "html" {
        "Export SlideX HTML"
    } else {
        "Export SlideX MDX"
    };
    let mut dialog = rfd::FileDialog::new()
        .set_title(title)
        .set_file_name(file_name.to_string_lossy().as_ref());

    dialog = if extension == "html" {
        dialog.add_filter("HTML", &["html"])
    } else {
        dialog.add_filter("MDX", &["mdx"])
    };

    let Some(path) = dialog.save_file() else {
        return Ok(None);
    };

    let export_path = ensure_file_extension(path, &extension);
    fs::write(&export_path, content).map_err(|error| format!("Could not export file: {error}"))?;

    Ok(Some(export_path.to_string_lossy().to_string()))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .menu(build_menu)
        .on_menu_event(|app, event| match event.id().as_ref() {
            "slidex_new_project" => emit_menu_action(app, "new"),
            "slidex_open_project" => emit_menu_action(app, "open"),
            "slidex_save_project" => emit_menu_action(app, "save"),
            "slidex_export_html" => emit_menu_action(app, "export-html"),
            "slidex_export_mdx" => emit_menu_action(app, "export-mdx"),
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![
            export_slidex_file,
            open_slidex_project_at,
            open_slidex_project,
            save_slidex_project,
        ])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn build_menu(app: &tauri::AppHandle) -> tauri::Result<Menu<tauri::Wry>> {
    let menu = Menu::default(app)?;
    let file_menu = Submenu::with_items(
        app,
        "File",
        true,
        &[
            &MenuItem::with_id(
                app,
                "slidex_new_project",
                "New Project",
                true,
                Some("CmdOrCtrl+N"),
            )?,
            &MenuItem::with_id(
                app,
                "slidex_open_project",
                "Open Project...",
                true,
                Some("CmdOrCtrl+O"),
            )?,
            &MenuItem::with_id(
                app,
                "slidex_save_project",
                "Save",
                true,
                Some("CmdOrCtrl+S"),
            )?,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(
                app,
                "slidex_export_html",
                "Export HTML...",
                true,
                Some("CmdOrCtrl+E"),
            )?,
            &MenuItem::with_id(
                app,
                "slidex_export_mdx",
                "Export MDX...",
                true,
                None::<&str>,
            )?,
            &PredefinedMenuItem::separator(app)?,
            &PredefinedMenuItem::close_window(app, None)?,
        ],
    )?;

    menu.insert(&file_menu, 1)?;
    Ok(menu)
}

fn emit_menu_action(app: &tauri::AppHandle, action: &str) {
    let _ = app.emit("slidex://menu", action);
}

fn read_project(project_dir: &Path) -> Result<SlidexProject, String> {
    if !project_dir.is_dir() {
        return Err("Selected path is not a SlideX project folder.".into());
    }

    let document_path = project_dir.join("document.mdx");
    let source = fs::read_to_string(&document_path)
        .map_err(|error| format!("Could not read document.mdx: {error}"))?;

    let name = read_manifest(project_dir)
        .map(|manifest| manifest.name)
        .unwrap_or_else(|| project_name_from_path(project_dir));

    Ok(SlidexProject {
        name,
        path: project_dir.to_string_lossy().to_string(),
        source,
    })
}

fn write_project(project_dir: &Path, source: &str) -> Result<(), String> {
    if project_dir.exists() && !project_dir.is_dir() {
        return Err("A file already exists at that project path.".into());
    }

    fs::create_dir_all(project_dir.join("assets"))
        .map_err(|error| format!("Could not create assets folder: {error}"))?;
    fs::create_dir_all(project_dir.join("exports"))
        .map_err(|error| format!("Could not create exports folder: {error}"))?;
    fs::write(project_dir.join("document.mdx"), source)
        .map_err(|error| format!("Could not write document.mdx: {error}"))?;

    let manifest = SlidexManifest {
        name: project_name_from_path(project_dir),
        version: 1,
        updated_at: current_timestamp(),
    };
    let manifest_json = serde_json::to_string_pretty(&manifest)
        .map_err(|error| format!("Could not serialize manifest: {error}"))?;
    fs::write(
        project_dir.join("manifest.json"),
        format!("{manifest_json}\n"),
    )
    .map_err(|error| format!("Could not write manifest.json: {error}"))?;

    Ok(())
}

fn read_manifest(project_dir: &Path) -> Option<SlidexManifest> {
    let manifest = fs::read_to_string(project_dir.join("manifest.json")).ok()?;
    serde_json::from_str(&manifest).ok()
}

fn project_name_from_path(project_dir: &Path) -> String {
    project_dir
        .file_stem()
        .and_then(|name| name.to_str())
        .filter(|name| !name.is_empty())
        .unwrap_or("Untitled")
        .to_string()
}

fn sanitize_project_name(name: &str) -> String {
    let sanitized = name
        .chars()
        .map(|character| match character {
            '/' | '\\' | ':' | '*' | '?' | '"' | '<' | '>' | '|' => '-',
            _ => character,
        })
        .collect::<String>()
        .trim()
        .trim_matches('.')
        .to_string();

    if sanitized.is_empty() {
        "Untitled".into()
    } else {
        sanitized
    }
}

fn ensure_slidex_extension(path: PathBuf) -> PathBuf {
    if path.extension().and_then(|extension| extension.to_str()) == Some("slidex") {
        path
    } else {
        path.with_extension("slidex")
    }
}

fn ensure_file_extension(path: PathBuf, extension: &str) -> PathBuf {
    if path.extension().and_then(|value| value.to_str()) == Some(extension) {
        path
    } else {
        path.with_extension(extension)
    }
}

fn sanitize_extension(extension: &str) -> String {
    let sanitized = extension
        .chars()
        .filter(|character| character.is_ascii_alphanumeric())
        .collect::<String>()
        .to_ascii_lowercase();

    if sanitized.is_empty() {
        "txt".into()
    } else {
        sanitized
    }
}

fn current_timestamp() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_secs())
        .unwrap_or_default()
}
