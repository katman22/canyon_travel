import WidgetKit
import SwiftUI

struct Entry: TimelineEntry {
    let date: Date
    let resort: String
    let toResort: String
    let fromResort: String
    let isConfigured: Bool
}

private func nextQuarterHour(from date: Date = Date()) -> Date {
    let cal = Calendar.current
    let comps = cal.dateComponents([.year, .month, .day, .hour, .minute], from: date)
    let minute = comps.minute ?? 0
    let nextQuarter = ((minute / 15) + 1) * 15
    var next = DateComponents()
    next.year = comps.year
    next.month = comps.month
    next.day = comps.day
    next.hour = comps.hour
    next.minute = nextQuarter % 60
    // if we rolled past :45 → bump the hour
    if nextQuarter >= 60 {
        next.hour = (comps.hour ?? 0) + 1
    }
    return cal.date(from: next) ?? date.addingTimeInterval(15*60)
}

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> Entry {
            Entry(date: .now, resort: "Loading…", toResort: "--", fromResort: "--", isConfigured: false)
        }

        func getSnapshot(in context: Context, completion: @escaping (Entry) -> Void) {
            completion(placeholder(in: context))
        }

        func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> Void) {
            guard let store = UserDefaults(suiteName: Shared.appGroup) else {
                let entry = Entry(date: .now, resort: "App Group error", toResort: "--", fromResort: "--", isConfigured: false)
                // retry in 15 min
                return completion(Timeline(entries: [entry], policy: .after(nextQuarterHour())))
            }

            guard let resortId = store.string(forKey: Shared.selectedResortKey), !resortId.isEmpty else {
                let entry = Entry(date: .now, resort: "Select a resort", toResort: "--", fromResort: "--", isConfigured: false)
                // optional: retry faster (e.g., 15 min) or stop with .atEnd
                return completion(Timeline(entries: [entry], policy: .after(nextQuarterHour())))
            }

            Task {
                let entry = await fetchEntry(resortId: resortId)
                // always schedule next refresh on the next quarter-hour (~every 15 min)
                let next = nextQuarterHour()
                completion(Timeline(entries: [entry], policy: .after(next)))
            }
        }

    private func fetchEntry(resortId: String) async -> Entry {
        guard var comps = URLComponents(string: "\(Shared.apiBase)/travel_times") else {
            return Entry(date: .now, resort: "Error", toResort: "--", fromResort: "--", isConfigured: true)
        }
        comps.queryItems = [URLQueryItem(name: "resort_id", value: resortId),
                            URLQueryItem(name: "_", value: String(Int(Date().timeIntervalSince1970)))] // cache-buster
        guard let url = comps.url else {
            return Entry(date: .now, resort: "Error", toResort: "--", fromResort: "--", isConfigured: true)
        }

        guard let store = UserDefaults(suiteName: Shared.appGroup) else {
                NSLog("[WIDGET] ERROR: Could not open app group store in fetchEntry")
                return Entry(date: .now, resort: "Error", toResort: "--", fromResort: "--", isConfigured: true)
            }

        let cfg = URLSessionConfiguration.ephemeral
        cfg.requestCachePolicy = .reloadIgnoringLocalCacheData
        cfg.timeoutIntervalForRequest = 5
        cfg.timeoutIntervalForResource = 8
        let session = URLSession(configuration: cfg)

        var req = URLRequest(url: url)
        req.setValue("application/json", forHTTPHeaderField: "Accept")
        let userId = store.string(forKey: "WIDGET_USER_ID") ?? ""
        let jwt = store.string(forKey: "WIDGET_JWT") ?? ""

        if !jwt.isEmpty {
            req.setValue("Bearer \(jwt)", forHTTPHeaderField: "Authorization")
        }

        if !userId.isEmpty {
            comps.queryItems?.append(URLQueryItem(name: "auth[user_id]", value: userId))
        }

        do {
            let (data, resp) = try await session.data(for: req)
            let code = (resp as? HTTPURLResponse)?.statusCode ?? -1
            NSLog("WIDGET /times status=\(code) bytes=\(data.count)")
            guard (200..<300).contains(code) else {
                return Entry(date: .now, resort: "Error 34 loading", toResort: "--", fromResort: "Tap to open", isConfigured: true)
            }
            let decoded = try JSONDecoder().decode(CanyonData.self, from: data)
            return Entry(date: .now,
                         resort: decoded.resort,
                         toResort: decoded.to_resort,
                         fromResort: decoded.from_resort,
                         isConfigured: true)
        } catch {
            NSLog("WIDGET NET ERR: \(error.localizedDescription)")
            return Entry(date: .now, resort: "Offline", toResort: "--", fromResort: "Open app", isConfigured: true)
        }
    }
}

struct CanyonTravellerWidgetView: View {
    var entry: Provider.Entry
    var body: some View {
        ZStack {
            LinearGradient(colors: [Color("WidgetTop"), Color("WidgetBottom")], startPoint: .top, endPoint: .bottom)
            VStack(alignment: .leading, spacing: 6) {
                Text(entry.resort).font(.headline).foregroundStyle(.primary).lineLimit(1)
                HStack {
                    VStack(alignment: .leading) {
                      Text("To resort").font(.caption).foregroundStyle(.secondary)
                      Text(entry.toResort).bold().foregroundStyle(.primary)
                    }
                    Spacer()
                    VStack(alignment: .leading) {
                      Text("From resort").font(.caption).foregroundStyle(.secondary)
                      Text(entry.fromResort).bold().foregroundStyle(.primary)
                    }
                }
                Spacer()
                Text("Canyon Traveller").font(.footnote).foregroundStyle(.primary.opacity(0.8))
            }
            .padding()
        }
        // Tap opens your RN screen to let user pick/change resort
        .widgetURL(URL(string: "canyontravel://widget-setup?source=widget")!)
    }
}
struct CanyonTravellerWidgetView_Previews: PreviewProvider {
    static var previews: some View {
        Group {
          CanyonTravellerWidgetView(entry: Provider.Entry(date: .now, resort: "Snowbird", toResort: "26 min", fromResort: "34 min", isConfigured: true))
                .previewContext(WidgetPreviewContext(family: .systemMedium))
                .environment(\.colorScheme, .light)

          CanyonTravellerWidgetView(entry: Provider.Entry(date: .now, resort: "Snowbird", toResort: "26 min", fromResort: "34 min", isConfigured: true))
                .previewContext(WidgetPreviewContext(family: .systemMedium))
                .environment(\.colorScheme, .dark)
        }
    }
}

@main
struct CanyonTravellerWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "CanyonTravellerWidget", provider: Provider()) { entry in
          CanyonTravellerWidgetView(entry: entry)
        }
        .configurationDisplayName("Canyon Travel")
        .description("Shows travel times for your selected resort.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}
