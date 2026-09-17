from collections import Counter


CLASS_NAMES = [
    "Smash",
    "Clear",
    "Net Shot",
    "Drop",
    "Drive"
]


def clean_predictions(predictions):
    """
    Remove consecutive duplicate predictions.

    Example:
    Clear, Clear, Clear, Drop, Drop, Smash

    becomes:
    Clear, Drop, Smash
    """

    if not predictions:
        return []

    cleaned = [predictions[0]]

    for prediction in predictions[1:]:

        if prediction != cleaned[-1]:
            cleaned.append(prediction)

    return cleaned


def calculate_shot_frequency(predictions):
    """
    Count how many times each shot appears.
    """

    counts = Counter(predictions)

    return {
        shot: counts.get(shot, 0)
        for shot in CLASS_NAMES
    }


def calculate_shot_distribution(predictions):
    """
    Calculate percentage distribution of shots.
    """

    frequency = calculate_shot_frequency(predictions)

    total = sum(frequency.values())

    if total == 0:
        return {
            shot: 0.0
            for shot in CLASS_NAMES
        }

    return {
        shot: round(
            (count / total) * 100,
            2
        )
        for shot, count in frequency.items()
    }


def calculate_sequences(predictions):
    """
    Return the chronological shot sequence
    after removing consecutive duplicates.
    """

    return clean_predictions(predictions)


def calculate_combinations(predictions):
    """
    Find most common 2-shot and 3-shot patterns.
    """

    sequence = clean_predictions(predictions)

    two_shot = Counter()
    three_shot = Counter()

    for i in range(len(sequence) - 1):

        pattern = (
            sequence[i],
            sequence[i + 1]
        )

        two_shot[pattern] += 1

    for i in range(len(sequence) - 2):

        pattern = (
            sequence[i],
            sequence[i + 1],
            sequence[i + 2]
        )

        three_shot[pattern] += 1

    return {
        "2_shot": [
            {
                "pattern": " → ".join(pattern),
                "count": count
            }
            for pattern, count
            in two_shot.most_common()
        ],

        "3_shot": [
            {
                "pattern": " → ".join(pattern),
                "count": count
            }
            for pattern, count
            in three_shot.most_common()
        ]
    }


def analyze_predictions(predictions):
    """
    Calculate all four analytics features.
    """

    sequence = calculate_sequences(
        predictions
    )

    return {
        "shot_frequency":
            calculate_shot_frequency(
                predictions
            ),

        "shot_distribution":
            calculate_shot_distribution(
                predictions
            ),

        "shot_sequence":
            sequence,

        "shot_combinations":
            calculate_combinations(
                predictions
            )
    }