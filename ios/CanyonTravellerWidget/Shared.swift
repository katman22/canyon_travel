// Shared.swift
import Foundation

enum Shared {
    static let appGroup = "group.com.wharepumanawa.canyontravel"
    static let selectedResortKey = "SELECTED_RESORT"
    static let apiBase = "https://pumanawa-kam.onrender.com/api/v1/canyon_times"
    static let bearer = "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhcHAiOiJtb2JpbGUiLCJleHAiOjIwNjIyODY1MzZ9.SeN6BWPJtm-_dADD37jqFKWoVkgjq_bnwbDWza-JEdc"
}

struct CanyonData: Decodable {
    let resort: String
    let to_resort: String
    let from_resort: String
}
